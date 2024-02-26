import fs = require('fs');
import path = require('path');
import * as GuidParser from '../parser/guidParser';
import * as Logger from '../vscodeUtils';

import * as UnityAssetConnector from '../unityAssetExplorer/unityAssetConnector';
import * as GuidConnector from '../parser/guidConnector';

var assetPath = '';
var refreshStartCallback: Function[] = [];
var refreshEndCallback: Function[] = [];

export async function initialize(workspacePath: string) {
    assetPath = path.join(workspacePath, 'Assets');
    addRefreshStartCallback(() => GuidConnector.refresh());
    addRefreshStartCallback(() => UnityAssetConnector.refresh());
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

function refreshUnityProject(dirPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                reject(err);
            } else {
                (async () => {
                for (const file of files) {
                    const extname = path.extname(file);
                    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
                        await refreshUnityProject(path.join(dirPath, file));
                    } else if (extname === '.meta' && file.includes('.cs.meta')) {
                        GuidParser.parseUnityCsGuid(path.join(dirPath, file));
                    } else if (extname === '.prefab' || extname === '.asset' || extname === '.unity') {
                        GuidParser.parseUnityAssets(path.join(dirPath, file));
                        if (extname !== '.asset') UnityAssetConnector.addAssetPath(path.join(dirPath, file));
                    }
                }
                resolve();
                })();
            }
        });
    });
}