import fs = require('fs');
import * as vscode from 'vscode';
import * as Logger from '../vscodeUtils';

interface MethodCall {
    targetId: string;
    targetAssemblyTypeName: string;
    methodName: string;
}

interface MethodLocation {
    filePath: string;
    lineNumber: number;
    componentId: string;
}

interface UnityComponent {
    type: string;
    methodCalls?: MethodCall[];
}

interface UnityMetaData {
    components: Map<string, UnityComponent>;
}

export class UnityMetaDataParser {
    private static readonly SUPPORTED_EXTENSIONS = ['.unity', '.prefab'];
    private static readonly COMPONENT_PATTERN = /^--- !u!\d+ &(\d+)\s*\n([^:]+):/gm;
    private static readonly METHOD_CALLS_SECTION_PATTERN = /m_PersistentCalls:\s*\n\s*m_Calls:\s*((?:\s*-[^-]*)*)/g;
    private static readonly SINGLE_METHOD_CALL_PATTERN = /- m_Target: {fileID: (\d+)}\s*\n\s*m_TargetAssemblyTypeName: ([^,\n]+)(?:,[^\n]+)?\s*\n\s*m_MethodName: ([^\n]+)/g;
    private static readonly ASSEMBLY_TYPE_LINE_PATTERN = /\s*m_TargetAssemblyTypeName:/;
    private static methodLocationCache: Map<string, MethodLocation[]> = new Map();

    public static registerFileOpenHandler(context: vscode.ExtensionContext) {
        let disposable = vscode.workspace.onDidOpenTextDocument(async (document) => {
            if (this.isSupportedAsset(document.fileName)) {
                const shouldParse = await vscode.window.showInformationMessage(
                    'Unity asset file detected. Would you like to parse the metadata?',
                    'Yes',
                    'No'
                );

                if (shouldParse === 'Yes') {
                    Logger.outputLog('Starting metadata parsing...');
                    await this.parseMetaData(document.fileName);
                    
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

    public static isSupportedAsset(filePath: string): boolean {
        const ext = filePath.toLowerCase().split('.').pop();
        return this.SUPPORTED_EXTENSIONS.includes(`.${ext}`);
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

    public static clearCache(): void {
        this.methodLocationCache.clear();
        Logger.outputLog('Method location cache has been cleared.');
    }

    private static getMethodFullPath(assemblyTypeName: string, methodName: string): string {
        const [typeName] = assemblyTypeName.split(',').map(s => s.trim());
        return `${typeName}.${methodName}`;
    }

    public static getMethodLocations(namespaceName: string, className: string, methodName: string): MethodLocation[] | undefined {
        const fullPath = `${namespaceName}.${className}.${methodName}`;
        return this.methodLocationCache.get(fullPath);
    }

    private static async extractMetaData(fileContent: string, filePath: string): Promise<void> {
        let match;
        let currentLine = 1;

        while ((match = this.COMPONENT_PATTERN.exec(fileContent)) !== null) {
            const [fullMatch, id, type] = match;
            const componentStartLine = fileContent.substring(0, match.index).split('\n').length;
            
            const nextComponentStart = fileContent.indexOf('--- !u!', this.COMPONENT_PATTERN.lastIndex);
            const componentContent = nextComponentStart === -1 
                ? fileContent.slice(this.COMPONENT_PATTERN.lastIndex)
                : fileContent.slice(this.COMPONENT_PATTERN.lastIndex, nextComponentStart);

            let methodSectionMatch;
            if ((methodSectionMatch = this.METHOD_CALLS_SECTION_PATTERN.exec(componentContent)) !== null) {
                const methodsSection = methodSectionMatch[1];
                let methodMatch;

                const methodSectionStartLine = componentStartLine + 
                    componentContent.substring(0, methodSectionMatch.index).split('\n').length;

                while ((methodMatch = this.SINGLE_METHOD_CALL_PATTERN.exec(methodsSection)) !== null) {
                    const [fullMethodMatch, targetId, targetAssemblyTypeName, methodName] = methodMatch;
                    const textBeforeMatch = methodsSection.substring(0, methodMatch.index);
                    const linesBeforeMatch = textBeforeMatch.split('\n').length;
                    
                    const methodLines = fullMethodMatch.split('\n');
                    let assemblyTypeLineOffset = 0;
                    for (let i = 0; i < methodLines.length; i++) {
                        if (this.ASSEMBLY_TYPE_LINE_PATTERN.test(methodLines[i])) {
                            assemblyTypeLineOffset = i;
                            break;
                        }
                    }
                    
                    const exactLineNumber = methodSectionStartLine + linesBeforeMatch + assemblyTypeLineOffset;

                    const fullPath = this.getMethodFullPath(targetAssemblyTypeName.trim(), methodName.trim());
                    const location: MethodLocation = {
                        filePath,
                        lineNumber: exactLineNumber,
                        componentId: id
                    };

                    const existingLocations = this.methodLocationCache.get(fullPath) || [];
                    this.methodLocationCache.set(fullPath, [...existingLocations, location]);
                }
            }
        }

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

    public static async parseMetaData(filePath: string): Promise<void> {
        try {
            const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
            await this.extractMetaData(data, filePath);
        } catch (error) {
            Logger.outputLog(`Error parsing Unity asset at ${filePath}: ${error}`);
        }
    }
}