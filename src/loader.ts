import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
import { outputLog } from './logger';
import { getGuid } from './parser';
import { updateStatus } from './vscode/command';
import { CodelensProvider } from './codelensProvider';

let assetPath: string;
let fileReferences: Map<string, string[]> = new Map<string, string[]>();

export async function initialize() {
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
}

export async function syncUnityFiles() {
  outputLog('Start unity files sync');
  fileReferences = await sync(assetPath, fileReferences);
  vscode.window.showInformationMessage('Finish unity files sync');
  outputLog('Finish unity files sync');
}

export function findFileReference() {
    const file = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (file === undefined) {
      outputLog('Cannot find current active editor');
      return;
    }
  
    const metaFile = fs.readFileSync(`${file + '.meta'}`, { encoding: 'utf8' });
    const guid = getGuid(metaFile);
  
    outputLog(`${path.basename(file)} reference list - ${metaFile}`);
  
    const referencedFiles = fileReferences.get(guid);
    if (referencedFiles) {
      referencedFiles.forEach(filePath => {
        outputLog(filePath);
      });
    } else {
      outputLog(`No files found that reference guid ${guid}`);
    }
}

async function sync(dirPath: string, fileReferences: Map<string, string[]>): Promise<Map<string, string[]>> {
    return new Promise(async (resolve, reject) => {
      try {
        const files = await fs.promises.readdir(dirPath);
  
        for (const file of files) {
          const extname = path.extname(file);
          const filePath = path.join(dirPath, file);
          const fileStat = await fs.promises.stat(filePath);
  
          if (fileStat.isDirectory()) {
            fileReferences = await sync(filePath, fileReferences);
          } else if (extname === '.prefab' || extname === '.asset' || extname === '.unity') {
            const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf8' });
            const metaFile = fs.readFileSync(`${filePath + '.meta'}`, { encoding: 'utf8' });
            const guid = getGuid(metaFile);
            outputLog(`${filePath + '.meta'}, ${guid}`);
  
            if (guid) {
              if (fileReferences.has(guid)) {
                fileReferences.get(guid)?.push(filePath);
              } else {
                fileReferences.set(guid, [filePath]);
              }
            }
          }
        }
  
        resolve(fileReferences);
      } catch (err) {
        reject(err);
      }
    });
}