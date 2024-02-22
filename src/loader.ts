import * as vscode from 'vscode';
import { outputLog } from './logger';
import { updateStatus } from './vscode/command';
import { MetaReferenceProvider } from './metaReferenceProvider';
import { MetaExplorer } from './metaExplorer';
import { MainViewProvider } from './webView/mainViewProvider';
import { MetaData } from './metaData';
import { isUnityProject } from './untiyChecker';
import { refreshUnityProject } from './refreshUnity';
const path = require('path');

let files: string[];
let assetPath: string;
let metaExplorer: MetaExplorer;
var metaDatas: Map<string, MetaData[]> = new Map<string, MetaData[]>();

export async function initialize(context: vscode.ExtensionContext) {
  const workspace = vscode.workspace.workspaceFolders;

  if (workspace !== undefined) {
    var workspacePath = workspace[0].uri.fsPath;
    assetPath = path.join(workspacePath, 'Assets');
    refreshUnityProject(workspacePath);
    // var validProject = isUnityProject(workspacePath);
    // updateStatus<boolean>('clover.workspace.valid', validProject);

    // if (!validProject) return;

    // const mainViewProvider = new MainViewProvider(context.extensionUri, workspacePath);
    // vscode.window.registerWebviewViewProvider('clover.mainView', mainViewProvider);

    // await refreshUnityProject();
    // updateStatus<boolean>('clover.unity.initialized', true);

    const codelensProvider = new MetaReferenceProvider();
    vscode.languages.registerCodeLensProvider('csharp', codelensProvider);
    // metaExplorer = new MetaExplorer(context);
  }
}

// export async function refreshUnityProject() {
//   vscode.window.showInformationMessage('Start Refresh Unity Project');
//   outputLog('Start Refresh Unity Project');
//   await refresh(assetPath);
//   vscode.window.showInformationMessage('Finish Refresh Unity Project');
//   outputLog('Finish Refresh Unity Project');
// }

// export function findMetaReference() {
//   const activeTextEditor = vscode.window.activeTextEditor;
//   if (!activeTextEditor) {
//     outputLog('Cannot find current active editor');
//     return;
//   }

//   const currentFilePath = activeTextEditor.document.uri.fsPath;
//   const currentFolder = path.dirname(currentFilePath);
  
//   metaExplorer.clearItems();

//   const metaFilePath = `${currentFilePath}.meta`;
//   if (!fs.existsSync(metaFilePath)) {
//     outputLog(`Meta file does not exist for ${path.basename(currentFilePath)}`);
//     return;
//   }

//   const guid = getGuid(metaFilePath);

//   outputLog(`${path.basename(currentFilePath)} reference list`);
//   const metaDatas = getMetaData(guid);
//   metaDatas.forEach((metaData) => {
//     const relativePath = path.relative(currentFolder, metaData.path);
//     metaExplorer.addItem(relativePath);
//     outputLog(metaData.path);
//   });
// }