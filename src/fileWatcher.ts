import * as vscode from 'vscode';
import * as path from 'path';
import * as GuidParser from './parser/guidParser';
import * as AssetParser from './parser/assetParser';
import * as GuidConnector from './parser/guidConnector';
import * as AssetConnector from './parser/assetConnector';
import * as UnityAssetConnector from './unityAssetExplorer/unityAssetConnector';
import * as Logger from './vscodeUtils';

// Per-file debounce timers to coalesce rapid successive saves
const pendingTimers = new Map<string, NodeJS.Timeout>();

function debounce(filePath: string, fn: () => void, delayMs = 500) {
    const existing = pendingTimers.get(filePath);
    if (existing) {
        clearTimeout(existing);
    }
    pendingTimers.set(filePath, setTimeout(() => {
        pendingTimers.delete(filePath);
        fn();
    }, delayMs));
}

async function handleMetaChange(filePath: string, onRefresh: () => void) {
    const csPath = path.join(path.dirname(filePath), path.basename(filePath, '.meta'));
    Logger.outputLog(`[FileWatcher] meta changed: ${filePath}`);
    GuidConnector.removeGuid(csPath);
    await GuidParser.parseUnityCsGuid(filePath);
    onRefresh();
}

function handleMetaDelete(filePath: string, onRefresh: () => void) {
    const csPath = path.join(path.dirname(filePath), path.basename(filePath, '.meta'));
    Logger.outputLog(`[FileWatcher] meta deleted: ${filePath}`);
    GuidConnector.removeGuid(csPath);
    onRefresh();
}

async function handleAssetChange(filePath: string, onRefresh: () => void) {
    const ext = path.extname(filePath);
    Logger.outputLog(`[FileWatcher] asset changed: ${filePath}`);

    GuidConnector.removeLocationsByFile(filePath);
    await GuidParser.parseUnityAssets(filePath);

    if (ext !== '.asset') {
        AssetConnector.removeLocationsByFile(filePath);
        UnityAssetConnector.removeAssetPath(filePath);
        await AssetParser.parseUnityAssets(filePath);
        UnityAssetConnector.addAssetPath(filePath);
    }

    onRefresh();
}

function handleAssetDelete(filePath: string, onRefresh: () => void) {
    const ext = path.extname(filePath);
    Logger.outputLog(`[FileWatcher] asset deleted: ${filePath}`);

    GuidConnector.removeLocationsByFile(filePath);

    if (ext !== '.asset') {
        AssetConnector.removeLocationsByFile(filePath);
        UnityAssetConnector.removeAssetPath(filePath);
    }

    onRefresh();
}

export function createFileWatchers(onRefresh: () => void): vscode.Disposable[] {
    const metaWatcher = vscode.workspace.createFileSystemWatcher('**/Assets/**/*.meta');
    const prefabWatcher = vscode.workspace.createFileSystemWatcher('**/Assets/**/*.prefab');
    const unityWatcher = vscode.workspace.createFileSystemWatcher('**/Assets/**/*.unity');
    const assetWatcher = vscode.workspace.createFileSystemWatcher('**/Assets/**/*.asset');

    const onAssetCreateOrChange = (uri: vscode.Uri) => {
        debounce(uri.fsPath, () => handleAssetChange(uri.fsPath, onRefresh));
    };
    const onAssetDelete = (uri: vscode.Uri) => {
        handleAssetDelete(uri.fsPath, onRefresh);
    };

    [prefabWatcher, unityWatcher, assetWatcher].forEach(w => {
        w.onDidCreate(onAssetCreateOrChange);
        w.onDidChange(onAssetCreateOrChange);
        w.onDidDelete(onAssetDelete);
    });

    metaWatcher.onDidCreate(uri => {
        if (uri.fsPath.endsWith('.cs.meta')) {
            debounce(uri.fsPath, () => handleMetaChange(uri.fsPath, onRefresh));
        }
    });
    metaWatcher.onDidChange(uri => {
        if (uri.fsPath.endsWith('.cs.meta')) {
            debounce(uri.fsPath, () => handleMetaChange(uri.fsPath, onRefresh));
        }
    });
    metaWatcher.onDidDelete(uri => {
        if (uri.fsPath.endsWith('.cs.meta')) {
            handleMetaDelete(uri.fsPath, onRefresh);
        }
    });

    return [metaWatcher, prefabWatcher, unityWatcher, assetWatcher];
}
