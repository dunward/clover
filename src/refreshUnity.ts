import fs = require('fs');
import path = require('path');
import * as GuidParser from './guidParser';
import * as Logger from './logger';

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