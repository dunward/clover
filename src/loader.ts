import * as vscode from 'vscode';
import fs = require('fs');
import path = require("path");
import { outputLog } from './logger';
import { getGuid } from './parser';

let prefabs: string[];

export function syncUnityFiles(dirPath: string) {
    outputLog("Start unity files sync");
    prefabs = sync(dirPath, []);
    vscode.window.showInformationMessage("Finish unity files sync");
    outputLog("Finish unity files sync");
}

export function findPrefabReference() {
    let file = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (file === undefined) {
        outputLog("Cannot find current active editor");
        return;
    }

    let metaFile = fs.readFileSync(`${file + '.meta'}`, { encoding: "utf8" });
    let guid = getGuid(metaFile);

    outputLog(`${path.basename(file)} prefab reference list`);
    
    prefabs.forEach(prefab => {
        if (fs.readFileSync(prefab).includes(guid)) {
            outputLog(prefab);
        }
    });
}

function sync(dirPath: string, arrayOfFiles: string[]) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles;
  
    files.forEach(file => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = sync(dirPath + "/" + file, arrayOfFiles);
        } else if (path.extname(file) === '.prefab') {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
  
    return arrayOfFiles;
}