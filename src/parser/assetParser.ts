import fs = require('fs');
import * as Logger from '../vscodeUtils';
import * as AssetConnector from './assetConnector';

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
const SINGLE_METHOD_CALL_PATTERN = /^\s*-\s*m_Target:\s*\{[^}]*fileID:\s*(-?\d+)[^}]*\}\s*[\r\n]+\s*m_TargetAssemblyTypeName:\s*([^\r\n,]+)(?:,[^\r\n]+)?\s*[\r\n]+\s*m_MethodName:\s*([^\r\n]+)/gm;
const ASSEMBLY_TYPE_LINE_PATTERN = /\s*m_TargetAssemblyTypeName:/;

export function isSupportedAsset(filePath: string): boolean {
    const ext = filePath.toLowerCase().split('.').pop();
    return SUPPORTED_EXTENSIONS.includes(`.${ext}`);
}

function getMethodFullPath(assemblyTypeName: string, methodName: string): string {
    const [typeName] = assemblyTypeName.split(',').map(s => s.trim());
    return `${typeName}.${methodName}`;
}

function buildNewlineIndex(s: string): number[] {
    const arr: number[] = [];
    let i = 0;
    while (true) {
        const p = s.indexOf('\n', i);
        if (p === -1) break;
        arr.push(p);
        i = p + 1;
    }
    return arr;
}

function indexToLine(nl: number[], idx: number): number {
    let lo = 0, hi = nl.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (nl[mid] <= idx) lo = mid + 1; else hi = mid;
    }
    return lo + 1;
}

export async function parseData(fileContent: string, filePath: string): Promise<Map<string, MethodLocation[]>> {
    const methodLocations = new Map<string, MethodLocation[]>();
    const nl = buildNewlineIndex(fileContent);

    for (const match of fileContent.matchAll(COMPONENT_PATTERN)) {
        const id = match[1];
        const componentStart = match.index! + match[0].length;
        const componentStartLine = indexToLine(nl, match.index!);

        const nextComponentStart = fileContent.indexOf('--- !u!', componentStart);
        const end = nextComponentStart === -1 ? fileContent.length : nextComponentStart;
        const componentContent = fileContent.slice(componentStart, end);

        for (const methodSectionMatch of componentContent.matchAll(METHOD_CALLS_SECTION_PATTERN)) {
            const methodsSection = methodSectionMatch[1];
            const methodSectionStartLine = indexToLine(nl, componentStart + methodSectionMatch.index!);

            for (const methodMatch of methodsSection.matchAll(SINGLE_METHOD_CALL_PATTERN)) {
                const targetAssemblyTypeName = methodMatch[2];
                const methodName = methodMatch[3];

                const beforeLen = methodMatch.index!;
                let linesBefore = 0;
                for (let i = 0; i < beforeLen; ) {
                    const p = methodsSection.indexOf('\n', i);
                    if (p === -1 || p >= beforeLen) break;
                    linesBefore++;
                    i = p + 1;
                }

                const fullMethodMatch = methodMatch[0];
                const asmIdx = fullMethodMatch.search(ASSEMBLY_TYPE_LINE_PATTERN);
                let assemblyTypeLineOffset = 0;
                if (asmIdx >= 0) {
                    for (let i = 0; i < asmIdx; ) {
                        const p = fullMethodMatch.indexOf('\n', i);
                        if (p === -1 || p >= asmIdx) break;
                        assemblyTypeLineOffset++;
                        i = p + 1;
                    }
                }

                const exactLineNumber = methodSectionStartLine + linesBefore + assemblyTypeLineOffset;
                const fullPath = getMethodFullPath(targetAssemblyTypeName.trim(), methodName.trim());
                const location: MethodLocation = { filePath, lineNumber: exactLineNumber, componentId: id };

                const arr = methodLocations.get(fullPath);
                if (arr) arr.push(location);
                else methodLocations.set(fullPath, [location]);

                AssetConnector.addMethodLocation(fullPath, location);
            }
        }
    }

    return methodLocations;
}

export async function parseUnityAssets(filePath: string): Promise<Map<string, MethodLocation[]> | null> {
    try {
        const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
        return await parseData(data, filePath);
    } catch (error) {
        Logger.outputLog(`Error parsing Unity asset at ${filePath}: ${error}`);
        return null;
    }
} 