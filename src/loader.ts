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
  const activeTextEditor = vscode.window.activeTextEditor;
  if (!activeTextEditor) {
    outputLog('Cannot find current active editor');
    return;
  }

  const currentFilePath = activeTextEditor.document.uri.fsPath;
  const currentFolder = path.dirname(currentFilePath);
  
  metaExplorer.clearItems();

  const metaFilePath = `${currentFilePath}.meta`;
  if (!fs.existsSync(metaFilePath)) {
    outputLog(`Meta file does not exist for ${path.basename(currentFilePath)}`);
    return;
  }

  const metaFileContent = fs.readFileSync(metaFilePath, { encoding: 'utf8' });
  const guid = getGuid(metaFileContent);

  outputLog(`${path.basename(currentFilePath)} reference list`);

  files.forEach(prefab => {
    const prefabContent = fs.readFileSync(prefab, { encoding: 'utf8' });
    if (prefabContent.includes(guid)) {
      const relativePath = path.relative(currentFolder, prefab);
      metaExplorer.addItem(relativePath);
      outputLog(relativePath);
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