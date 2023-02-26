import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
import { outputLog } from './logger';
import { getGuid } from './parser';
import { updateStatus } from './vscode/command';
import { CodelensProvider } from './codelensProvider';
import { MetaExplorer } from './metaExplorer';

let files: string[];
let assetPath: string;
let metaExplorer: MetaExplorer;

export async function initialize(context: vscode.ExtensionContext) {
  const workspace = vscode.workspace.workspaceFolders;

  if (workspace !== undefined) {
    assetPath = path.join(workspace[0].uri.fsPath, 'Assets');
    updateStatus<boolean>('clover.workspace.valid', fs.lstatSync(assetPath).isDirectory());

    await syncUnityFiles();
    updateStatus<boolean>('clover.unity.initialized', true);
  }

  const codelensProvider = new CodelensProvider();
  vscode.commands.registerCommand('clover.unity.codeLensAction', (args: any) => {
    vscode.window.showInformationMessage(`CodeLens action clicked with args=${args}`);
  });

  vscode.languages.registerCodeLensProvider('csharp', codelensProvider);

  metaExplorer = new MetaExplorer(context);
}

export async function syncUnityFiles() {
  outputLog('Start unity files sync');
  files = await sync(assetPath, []);
  vscode.window.showInformationMessage('Finish unity files sync');
  outputLog('Finish unity files sync');
}

export function findFileReference() {
  const file = vscode.window.activeTextEditor?.document.uri.fsPath;
  if (file === undefined) {
    outputLog('Cannot find current active editor');
    return;
  }
  
  metaExplorer.clearItems();

  const metaFile = fs.readFileSync(`${file + '.meta'}`, { encoding: 'utf8' });
  const guid = getGuid(metaFile);

  outputLog(`${path.basename(file)} reference list`);

  files.forEach(prefab => {
    if (fs.readFileSync(prefab).includes(guid)) {
      metaExplorer.addItem(prefab);
      outputLog(prefab);
    }
  });
}

function sync(dirPath: string, arrayOfFiles: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        (async () => {
          for (const file of files) {
            const extname = path.extname(file);
            if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
              arrayOfFiles = await sync(path.join(dirPath, file), arrayOfFiles);
            } else if (extname === '.prefab' || extname === '.asset' || extname === '.unity') {
              arrayOfFiles.push(path.join(dirPath, file));
            }
          }
          resolve(arrayOfFiles);
        })();
      }
    });
  });
}