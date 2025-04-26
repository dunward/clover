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
    Logger.outputLog('Cached method location information:');
    if (methodLocationCache.size > 0) {
        Logger.outputLog('----------------------------------------');
        methodLocationCache.forEach((locations, fullPath) => {
            Logger.outputLog(`\n[Method: ${fullPath}]`);
            locations.forEach(loc => {
                Logger.outputLog(`  File: ${loc.filePath}`);
                Logger.outputLog(`  Line: ${loc.lineNumber}`);
                Logger.outputLog(`  Component ID: ${loc.componentId}`);
            });
        });
        Logger.outputLog('----------------------------------------');
    }
}

export function addMethodLocation(fullPath: string, location: MethodLocation) {
    const existingLocations = methodLocationCache.get(fullPath) || [];
    methodLocationCache.set(fullPath, [...existingLocations, location]);
    logCacheContents();
}

export function clearCache(): void {
    methodLocationCache.clear();
    Logger.outputLog('Method location cache has been cleared.');
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