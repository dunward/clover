import fs = require('fs');
import path = require('path');
import * as GuidParser from '../parser/guidParser';
import * as Logger from '../vscodeUtils';

export async function initialize(workspacePath: string) {
    const assetPath = path.join(workspacePath, 'Assets');
    Logger.outputLog("Start initializing Unity project");
    await refreshUnityProject(assetPath);
    Logger.outputLog("Unity project initialized");
}

export function refreshUnityProject(dirPath: string): Promise<void> {
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
                    }
                }
                resolve();
                })();
            }
        });
    });
}

export function isUnityProject(projectPath: string): boolean {
    var assetPath = path.join(projectPath, 'Assets');
    var projectSettingsPath = path.join(projectPath, 'ProjectSettings');
    
    return fs.existsSync(assetPath) && fs.existsSync(projectSettingsPath);
}