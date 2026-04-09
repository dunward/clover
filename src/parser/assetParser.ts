import fs = require('fs');
import * as path from 'path';
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

const SUPPORTED_EXTENSIONS = ['.unity', '.prefab', '.asset'];
const COMPONENT_PATTERN = /^--- !u!\d+ &(\d+)\s*\n([^:]+):/gm;
const METHOD_CALLS_SECTION_PATTERN = /m_PersistentCalls:\s*\n\s*m_Calls:\s*((?:\s*-[^-]*)*)/g;
const SINGLE_METHOD_CALL_PATTERN = /^\s*-\s*m_Target:\s*\{[^}]*fileID:\s*(-?\d+)[^}]*\}\s*[\r\n]+\s*m_TargetAssemblyTypeName:\s*([^\r\n,]+)(?:,[^\r\n]+)?\s*[\r\n]+\s*m_MethodName:\s*([^\r\n]+)/gm;
const ASSEMBLY_TYPE_LINE_PATTERN = /\s*m_TargetAssemblyTypeName:/;
const MODIFICATION_ENTRY_PATTERN = /^\s*-\s*target:\s*\{[^}]*fileID:\s*(-?\d+)[^}]*\}\s*[\r\n]+\s*propertyPath:\s*([^\r\n]+)[\r\n]+\s*value:\s*([^\r\n]*)/gm;

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

function parsePrefabModifications(
    componentContent: string,
    filePath: string,
    nl: number[],
    componentStart: number,
    methodLocations: Map<string, MethodLocation[]>,
    fileName: string
): number {
    // key = "fileID:pathPrefix" e.g. "6066691498601217245:_voidEvent.m_PersistentCalls.m_Calls.Array.data[0]"
    const typeNames = new Map<string, { value: string; lineNumber: number }>();
    const methodNames = new Map<string, { value: string; lineNumber: number }>();

    for (const match of componentContent.matchAll(MODIFICATION_ENTRY_PATTERN)) {
        const fileId = match[1];
        const propertyPath = match[2].trim();
        const value = match[3].trim();

        if (!propertyPath.includes('m_PersistentCalls')) continue;

        const lastDot = propertyPath.lastIndexOf('.');
        if (lastDot === -1) continue;
        const prefix = propertyPath.substring(0, lastDot);
        const field = propertyPath.substring(lastDot + 1);

        if (field !== 'm_TargetAssemblyTypeName' && field !== 'm_MethodName') continue;

        // Line number of the value: line within the full file
        const matchStr = match[0];
        const valuePos = matchStr.search(/\bvalue:/);
        let valueLineOffset = 0;
        for (let k = 0; k < valuePos; k++) {
            if (matchStr[k] === '\n') valueLineOffset++;
        }
        const lineNumber = indexToLine(nl, componentStart + match.index!) + valueLineOffset;

        const key = `${fileId}:${prefix}`;
        if (field === 'm_TargetAssemblyTypeName') {
            typeNames.set(key, { value, lineNumber });
        } else {
            methodNames.set(key, { value, lineNumber });
        }
    }

    let count = 0;
    for (const [key, typeInfo] of typeNames) {
        const methodInfo = methodNames.get(key);
        if (!methodInfo || !typeInfo.value || !methodInfo.value) continue;

        const fileId = key.substring(0, key.indexOf(':'));
        const fullPath = getMethodFullPath(typeInfo.value, methodInfo.value);
        const location: MethodLocation = { filePath, lineNumber: typeInfo.lineNumber, componentId: fileId };

        count++;
        Logger.outputLog(`[AssetParser] ${fileName}: prefab mod -> ${fullPath} (line ${typeInfo.lineNumber}, component ${fileId})`);

        const arr = methodLocations.get(fullPath);
        if (arr) arr.push(location);
        else methodLocations.set(fullPath, [location]);

        AssetConnector.addMethodLocation(fullPath, location);
    }

    return count;
}

export async function parseData(fileContent: string, filePath: string): Promise<Map<string, MethodLocation[]>> {
    const methodLocations = new Map<string, MethodLocation[]>();
    const nl = buildNewlineIndex(fileContent);
    const fileName = path.basename(filePath);

    let componentCount = 0;
    let sectionCount = 0;
    let methodCallCount = 0;

    for (const match of fileContent.matchAll(COMPONENT_PATTERN)) {
        componentCount++;
        const id = match[1];
        const componentType = match[2].trim();
        const componentStart = match.index! + match[0].length;

        const nextComponentStart = fileContent.indexOf('--- !u!', componentStart);
        const end = nextComponentStart === -1 ? fileContent.length : nextComponentStart;
        const componentContent = fileContent.slice(componentStart, end);

        if (componentType === 'PrefabInstance') {
            const found = parsePrefabModifications(componentContent, filePath, nl, componentStart, methodLocations, fileName);
            methodCallCount += found;
            continue;
        }

        for (const methodSectionMatch of componentContent.matchAll(METHOD_CALLS_SECTION_PATTERN)) {
            sectionCount++;
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

                methodCallCount++;
                Logger.outputLog(`[AssetParser] ${fileName}: found method call -> ${fullPath} (line ${exactLineNumber}, component ${id})`);

                const arr = methodLocations.get(fullPath);
                if (arr) arr.push(location);
                else methodLocations.set(fullPath, [location]);

                AssetConnector.addMethodLocation(fullPath, location);
            }
        }
    }

    Logger.outputLog(`[AssetParser] ${fileName}: ${componentCount} components, ${sectionCount} inline sections, ${methodCallCount} method calls`);

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