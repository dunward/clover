import fs = require('fs');
import path = require('path');
import * as GuidParser from '../parser/guidParser';
import * as AssetParser from '../parser/assetParser';

import * as UnityAssetConnector from '../unityAssetExplorer/unityAssetConnector';
import * as GuidConnector from '../parser/guidConnector';
import * as AssetConnector from '../parser/assetConnector';

import * as Logger from '../vscodeUtils';

var assetPath = '';
var refreshStartCallback: Function[] = [];
var refreshEndCallback: Function[] = [];

export async function initialize(workspacePath: string) {
    assetPath = path.join(workspacePath, 'Assets');
    addRefreshStartCallback(() => GuidConnector.refresh());
    addRefreshStartCallback(() => UnityAssetConnector.refresh());
    addRefreshStartCallback(() => AssetConnector.refresh());
    await refresh();
}

export async function refresh() {
    Logger.outputLog("Start refreshing Unity project");
    refreshStartCallback.forEach((callback) => callback());
    await refreshUnityProject(assetPath);
    refreshEndCallback.forEach((callback) => callback());
    Logger.outputLog("Unity project refreshed");
}

export function addRefreshStartCallback(callback: Function) {
    refreshStartCallback.push(callback);
}

export function addRefreshEndCallback(callback: Function) {
    refreshEndCallback.push(callback);
}

export function isUnityProject(projectPath: string): boolean {
    var assetPath = path.join(projectPath, 'Assets');
    var projectSettingsPath = path.join(projectPath, 'ProjectSettings');
    
    return fs.existsSync(assetPath) && fs.existsSync(projectSettingsPath);
}

async function collectAllFiles(dirPath: string): Promise<string[]> {
    let files: string[] = [];
    const dirents = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const dirent of dirents) {
        const fullPath = path.join(dirPath, dirent.name);
        if (dirent.isDirectory()) {
            files = files.concat(await collectAllFiles(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

async function refreshUnityProject(dirPath: string): Promise<void> {
    try {
        const allFiles = await collectAllFiles(dirPath);
        const total = allFiles.length;
        let finished = 0;

        Logger.outputLog(`Refreshing Unity project: ${total} files`);

        const tasks = allFiles.map(async (filePath, index) => {
            const extname = path.extname(filePath);
            try {
                if (extname === '.meta' && filePath.endsWith('.cs.meta')) {
                    await GuidParser.parseUnityCsGuid(filePath);
                } else if (extname === '.prefab' || extname === '.asset' || extname === '.unity') {
                    await GuidParser.parseUnityAssets(filePath);
                    if (extname !== '.asset') {
                        await AssetParser.parseUnityAssets(filePath);
                        UnityAssetConnector.addAssetPath(filePath);
                    }
                }
            } finally {
                finished++;
                Logger.outputLog(`Refreshing Unity project: ${finished}/${total} (${filePath})`);
            }
        });

        await Promise.all(tasks);
        Logger.outputLog(`Refreshing Unity project finished`);

    } catch (err) {
        Logger.outputLog(`Error while refreshing Unity project: ${err}`);
        throw err;
    }
}