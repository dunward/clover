import * as vscode from 'vscode';
import * as path from 'path';
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

function splitFullPath(key: string): { namespace?: string; className: string; methodName: string } {
    const parts = key.split('.');
    if (parts.length === 2) return { className: parts[0], methodName: parts[1] };
    const methodName = parts.pop()!;
    const className = parts.pop()!;
    const namespace = parts.length ? parts.join('.') : undefined;
    return { namespace, className, methodName };
}

export function addMethodLocation(fullPath: string, location: MethodLocation) {
    const existingLocations = methodLocationCache.get(fullPath) || [];
    methodLocationCache.set(fullPath, [...existingLocations, location]);
    Logger.outputLog(`[AssetConnector] addMethodLocation: ${fullPath} <- ${path.basename(location.filePath)} (total: ${existingLocations.length + 1})`);
    logCacheContents();
}

export function removeLocationsByFile(filePath: string): void {
    let removedCount = 0;
    methodLocationCache.forEach((locations, key) => {
        const filtered = locations.filter(loc => loc.filePath !== filePath);
        removedCount += locations.length - filtered.length;
        if (filtered.length === 0) {
            methodLocationCache.delete(key);
        } else {
            methodLocationCache.set(key, filtered);
        }
    });
    Logger.outputLog(`[AssetConnector] removeLocationsByFile: ${path.basename(filePath)} -> removed ${removedCount} entries`);
}

export function refresh(): void {
    methodLocationCache.clear();
}

export function validateMethod(namespaceName: string, className: string, methodName: string) {
    const result = { isValid: false, componentIds: [] as string[], foundIn: [] as string[], locations: [] as MethodLocation[] };
    methodLocationCache.forEach((locations, fullPath) => {
        const k = splitFullPath(fullPath);
        if (k.className === className &&
            k.methodName === methodName &&
            (!namespaceName || k.namespace === namespaceName)) {
            result.isValid = true;
            for (const loc of locations) {
                result.componentIds.push(loc.componentId);
                result.foundIn.push(loc.filePath);
                result.locations.push(loc);
            }
        }
    });
    if (result.isValid) {
        Logger.outputLog(`[AssetConnector] validateMethod: ${namespaceName}.${className}.${methodName} -> ${result.foundIn.length} usages in [${result.foundIn.map(f => path.basename(f)).join(', ')}]`);
    }
    return result;
}

export function getMethodLocations(namespaceName: string, className: string, methodName: string) {
    const key2 = `${className}.${methodName}`;
    const key3 = namespaceName ? `${namespaceName}.${className}.${methodName}` : undefined;
    return (key3 && methodLocationCache.get(key3)) || methodLocationCache.get(key2);
}