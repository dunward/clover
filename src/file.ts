import * as vscode from 'vscode';
import fs = require('fs');
import path = require("path");
import { outputLog } from './output';

export function syncUnityFiles(dirPath: string) {
    outputLog("Start unity files sync");
    sync(dirPath, []);
    vscode.window.showInformationMessage("Finish unity files sync");
    outputLog("Finish unity files sync");
}

function sync(dirPath: string, arrayOfFiles: string[]) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles;
  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = sync(dirPath + "/" + file, arrayOfFiles);
      } else if (path.extname(file) === '.meta') {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    });
  
    return arrayOfFiles;
}