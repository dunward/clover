import fs = require('fs');
import * as Logger from '../vscodeUtils';

interface MethodCall {
    targetId: string;
    targetAssemblyTypeName: string;
    methodName: string;
}

export interface MethodLocation {
    filePath: string;
    lineNumber: number;
    componentId: string;
}

const SUPPORTED_EXTENSIONS = ['.unity', '.prefab'];
const COMPONENT_PATTERN = /^--- !u!\d+ &(\d+)\s*\n([^:]+):/gm;
const METHOD_CALLS_SECTION_PATTERN = /m_PersistentCalls:\s*\n\s*m_Calls:\s*((?:\s*-[^-]*)*)/g;
const SINGLE_METHOD_CALL_PATTERN = /- m_Target: {fileID: (\d+)}\s*\n\s*m_TargetAssemblyTypeName: ([^,\n]+)(?:,[^\n]+)?\s*\n\s*m_MethodName: ([^\n]+)/g;
const ASSEMBLY_TYPE_LINE_PATTERN = /\s*m_TargetAssemblyTypeName:/;

export function isSupportedAsset(filePath: string): boolean {
    const ext = filePath.toLowerCase().split('.').pop();
    return SUPPORTED_EXTENSIONS.includes(`.${ext}`);
}

function getMethodFullPath(assemblyTypeName: string, methodName: string): string {
    const [typeName] = assemblyTypeName.split(',').map(s => s.trim());
    return `${typeName}.${methodName}`;
}

async function extractMetaData(fileContent: string, filePath: string): Promise<Map<string, MethodLocation[]>> {
    const methodLocations = new Map<string, MethodLocation[]>();
    let match;

    while ((match = COMPONENT_PATTERN.exec(fileContent)) !== null) {
        const [fullMatch, id, type] = match;
        const componentStartLine = fileContent.substring(0, match.index).split('\n').length;
        
        const nextComponentStart = fileContent.indexOf('--- !u!', COMPONENT_PATTERN.lastIndex);
        const componentContent = nextComponentStart === -1 
            ? fileContent.slice(COMPONENT_PATTERN.lastIndex)
            : fileContent.slice(COMPONENT_PATTERN.lastIndex, nextComponentStart);

        let methodSectionMatch;
        if ((methodSectionMatch = METHOD_CALLS_SECTION_PATTERN.exec(componentContent)) !== null) {
            const methodsSection = methodSectionMatch[1];
            let methodMatch;

            const methodSectionStartLine = componentStartLine + 
                componentContent.substring(0, methodSectionMatch.index).split('\n').length;

            while ((methodMatch = SINGLE_METHOD_CALL_PATTERN.exec(methodsSection)) !== null) {
                const [fullMethodMatch, targetId, targetAssemblyTypeName, methodName] = methodMatch;
                const textBeforeMatch = methodsSection.substring(0, methodMatch.index);
                const linesBeforeMatch = textBeforeMatch.split('\n').length;
                
                const methodLines = fullMethodMatch.split('\n');
                let assemblyTypeLineOffset = 0;
                for (let i = 0; i < methodLines.length; i++) {
                    if (ASSEMBLY_TYPE_LINE_PATTERN.test(methodLines[i])) {
                        assemblyTypeLineOffset = i;
                        break;
                    }
                }
                
                const exactLineNumber = methodSectionStartLine + linesBeforeMatch + assemblyTypeLineOffset;

                const fullPath = getMethodFullPath(targetAssemblyTypeName.trim(), methodName.trim());
                const location: MethodLocation = {
                    filePath,
                    lineNumber: exactLineNumber,
                    componentId: id
                };

                const existingLocations = methodLocations.get(fullPath) || [];
                methodLocations.set(fullPath, [...existingLocations, location]);
            }
        }
    }

    return methodLocations;
}

export async function parseMetaData(filePath: string): Promise<Map<string, MethodLocation[]> | null> {
    try {
        const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
        return await extractMetaData(data, filePath);
    } catch (error) {
        Logger.outputLog(`Error parsing Unity asset at ${filePath}: ${error}`);
        return null;
    }
} 