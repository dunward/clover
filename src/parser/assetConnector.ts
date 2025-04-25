import * as vscode from 'vscode';
import * as Logger from '../vscodeUtils';
import { UnityMetaDataParser, MethodLocation } from './assetParser';

export class UnityAssetConnector {
    private static methodLocationCache: Map<string, MethodLocation[]> = new Map();

    public static registerFileOpenHandler(context: vscode.ExtensionContext) {
        let disposable = vscode.workspace.onDidOpenTextDocument(async (document) => {
            if (UnityMetaDataParser.isSupportedAsset(document.fileName)) {
                const shouldParse = await vscode.window.showInformationMessage(
                    'Unity asset file detected. Would you like to parse the metadata?',
                    'Yes',
                    'No'
                );

                if (shouldParse === 'Yes') {
                    Logger.outputLog('Starting metadata parsing...');
                    const parseResult = await UnityMetaDataParser.parseMetaData(document.fileName);
                    if (parseResult) {
                        this.updateMethodLocationCache(parseResult);
                    }
                    
                    if (this.methodLocationCache.size > 0) {
                        vscode.window.showInformationMessage(
                            `Parsing complete! Found ${this.methodLocationCache.size} method calls.`
                        );
                    }
                }
            }
        });

        context.subscriptions.push(disposable);
    }

    private static updateMethodLocationCache(parseResults: Map<string, MethodLocation[]>) {
        parseResults.forEach((locations, fullPath) => {
            const existingLocations = this.methodLocationCache.get(fullPath) || [];
            this.methodLocationCache.set(fullPath, [...existingLocations, ...locations]);
        });
        this.logCacheContents();
    }

    private static logCacheContents() {
        Logger.outputLog('Cached method location information:');
        if (this.methodLocationCache.size > 0) {
            Logger.outputLog('----------------------------------------');
            this.methodLocationCache.forEach((locations, fullPath) => {
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

    public static clearCache(): void {
        this.methodLocationCache.clear();
        Logger.outputLog('Method location cache has been cleared.');
    }

    public static validateMethod(namespaceName: string, className: string, methodName: string): { 
        isValid: boolean; 
        componentIds: string[];
        foundIn: string[];
    } {
        const result = {
            isValid: false,
            componentIds: [] as string[],
            foundIn: [] as string[]
        };

        this.methodLocationCache.forEach((locations, fullPath) => {
            locations.forEach(loc => {
                const [typeName, methodName] = fullPath.split('.');
                if (typeName === namespaceName && 
                    methodName === methodName) {
                    result.isValid = true;
                    result.componentIds.push(loc.componentId);
                    result.foundIn.push(loc.filePath);
                }
            });
        });

        return result;
    }

    public static getMethodLocations(namespaceName: string, className: string, methodName: string): MethodLocation[] | undefined {
        const fullPath = `${namespaceName}.${className}.${methodName}`;
        return this.methodLocationCache.get(fullPath);
    }
} 