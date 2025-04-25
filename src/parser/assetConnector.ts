import * as vscode from 'vscode';
import * as Logger from '../vscodeUtils';
import { MethodLocation, isSupportedAsset, parseUnityAssets } from './assetParser';

const methodLocationCache: Map<string, MethodLocation[]> = new Map();

export function registerFileOpenHandler(context: vscode.ExtensionContext) {
    let disposable = vscode.workspace.onDidOpenTextDocument(async (document) => {
        if (isSupportedAsset(document.fileName)) {
            const shouldParse = await vscode.window.showInformationMessage(
                'Unity asset file detected. Would you like to parse the metadata?',
                'Yes',
                'No'
            );

            if (shouldParse === 'Yes') {
                Logger.outputLog('Starting metadata parsing...');
                const parseResult = await parseUnityAssets(document.fileName);
                if (parseResult) {
                    updateMethodLocationCache(parseResult);
                }
                
                if (methodLocationCache.size > 0) {
                    vscode.window.showInformationMessage(
                        `Parsing complete! Found ${methodLocationCache.size} method calls.`
                    );
                }
            }
        }
    });

    context.subscriptions.push(disposable);
}

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
} {
    const result = {
        isValid: false,
        componentIds: [] as string[],
        foundIn: [] as string[]
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
            }
        });
    });

    return result;
}

export function getMethodLocations(namespaceName: string, className: string, methodName: string): MethodLocation[] | undefined {
    const fullPath = `${namespaceName}.${className}.${methodName}`;
    return methodLocationCache.get(fullPath);
} 