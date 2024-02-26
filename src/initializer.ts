import * as vscode from 'vscode';
import * as CommandController from './controller/commandController';
import * as ProviderController from './controller/providerController';
import * as UnityProjectController from './controller/unityProjectController';
import * as UnityAssetViewer from './unityAssetViewer/unityAssetViewer';
import * as VSCodeUtils from './vscodeUtils';

export async function initialize(context: vscode.ExtensionContext) {
    var workspacePath = VSCodeUtils.getWorkspacePath();
    if (!UnityProjectController.isUnityProject(workspacePath)) return;

    await UnityProjectController.initialize(workspacePath);
    
    ProviderController.initialize(context);
    UnityAssetViewer.init();
    
    CommandController.updateStatus<boolean>('clover.workspace.valid', true);
    // CommandController.updateStatus<boolean>('clover.unity.initialized', true);

    CommandController.initialize(context, workspacePath);
}

