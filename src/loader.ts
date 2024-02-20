import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
import { outputLog } from './logger';
import { getGuid, getGuids } from './parser';
import { updateStatus } from './vscode/command';
import { CodelensProvider } from './codelensProvider';
import { MetaExplorer } from './metaExplorer';
import { MainViewProvider } from './view/mainViewProvider';
import { MetaData } from './metaData';
import { isUnityProject } from './untiyChecker';

let files: string[];
let assetPath: string;
let metaExplorer: MetaExplorer;
var metaDatas: Map<string, MetaData[]> = new Map<string, MetaData[]>();

export async function initialize(context: vscode.ExtensionContext) {
  const workspace = vscode.workspace.workspaceFolders;

  if (workspace !== undefined) {
    var workspacePath = workspace[0].uri.fsPath;
    assetPath = path.join(workspacePath, 'Assets');
    var validProject = isUnityProject(workspacePath);
    updateStatus<boolean>('clover.workspace.valid', validProject);

    if (!validProject) return;

    const mainViewProvider = new MainViewProvider(context.extensionUri, workspacePath);
    vscode.window.registerWebviewViewProvider('clover.mainView', mainViewProvider);

    await refreshUnityProject();
    updateStatus<boolean>('clover.unity.initialized', true);

    const codelensProvider = new CodelensProvider();
    vscode.languages.registerCodeLensProvider('csharp', codelensProvider);
    metaExplorer = new MetaExplorer(context);
  }
}

export async function refreshUnityProject() {
  vscode.window.showInformationMessage('Start Refresh Unity Project');
  outputLog('Start Refresh Unity Project');
  await refresh(assetPath);
  vscode.window.showInformationMessage('Finish Refresh Unity Project');
  outputLog('Finish Refresh Unity Project');
}

export function findMetaReference() {
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

  const guid = getGuid(metaFilePath);

  outputLog(`${path.basename(currentFilePath)} reference list`);
  const metaDatas = getMetaData(guid);
  metaDatas.forEach((metaData) => {
    const relativePath = path.relative(currentFolder, metaData.path);
    metaExplorer.addItem(relativePath);
    outputLog(metaData.path);
  });
}

function refresh(dirPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        (async () => {
          for (const file of files) {
            const extname = path.extname(file);
            if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
              await refresh(path.join(dirPath, file));
            } else if (extname === '.prefab' || extname === '.asset' || extname === '.unity') {
              readMeta(path.join(dirPath, file));
            }
          }
          resolve();
        })();
      }
    });
  });
}

async function readMeta(path: string) {
  try {
    const data = await fs.promises.readFile(path, { encoding: 'utf8' });
    const guids = getGuids(data);
    for (const guid of guids) {
      addMetaData(guid[1], path);
    }
  } catch (error) {
    outputLog(`Error reading meta file at ${path}: ${error}`);
  }
}

function addMetaData(guid: string, path: string) {
  if (metaDatas.has(guid)) {
    var list = metaDatas.get(guid);
    list?.push(new MetaData(path));
  } else {
    metaDatas.set(guid, [new MetaData(path)]);
  }
}

export function getMetaData(guid: string) {
  return metaDatas.get(guid) ?? [];
}