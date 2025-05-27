import * as vscode from 'vscode';
import * as Logger from '../vscodeUtils';
import { MethodLocation, isSupportedAsset, parseUnityAssets } from './assetParser';

const methodLocationCache: Map<string, MethodLocation[]> = new Map();

function updateMethodLocationCache(parseResults: Map<string, MethodLocation[]>) {
    parseResults.forEach((locations, fullPath) => {
        const existingLocations = methodLocationCache.get(fullPath) || [];
        methodLocationCache.set(fullPath, [...existingLocations, ...locations]);
    });
    logCacheContents();
}

function logCacheContents() {
    if (methodLocationCache.size > 0) {
        methodLocationCache.forEach((locations, fullPath) => {
            locations.forEach(loc => {
            });
        });
    }
}

export function addMethodLocation(fullPath: string, location: MethodLocation) {
    const existingLocations = methodLocationCache.get(fullPath) || [];
    methodLocationCache.set(fullPath, [...existingLocations, location]);
    logCacheContents();
}

export function refresh(): void {
    methodLocationCache.clear();
}

export function validateMethod(namespaceName: string, className: string, methodName: string): { 
    isValid: boolean; 
    componentIds: string[];
    foundIn: string[];
    locations: MethodLocation[];
} {
    const result = {
        isValid: false,
        componentIds: [] as string[],
        foundIn: [] as string[],
        locations: [] as MethodLocation[]
    };

    methodLocationCache.forEach((locations, fullPath) => {
        locations.forEach(loc => {
            const parts = fullPath.split('.');
            const typeName = parts[0];
            const methodNameFromPath = parts[parts.length - 1];
            
            if (typeName === namespaceName && 
                methodNameFromPath === methodName) {
                result.isValid = true;
                result.componentIds.push(loc.componentId);
                result.foundIn.push(loc.filePath);
                result.locations.push(loc);
            }
        });
    });

    return result;
}

export function getMethodLocations(namespaceName: string, className: string, methodName: string): MethodLocation[] | undefined {
    const fullPath = `${namespaceName}.${className}.${methodName}`;
    return methodLocationCache.get(fullPath);
} 