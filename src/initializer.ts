import * as vscode from 'vscode';
import * as CommandController from './controller/commandController';
import * as ProviderController from './controller/providerController';
import * as UnityProjectController from './controller/unityProjectController';

export async function initialize(context: vscode.ExtensionContext) {
    const workspace = vscode.workspace.workspaceFolders;

    if (workspace !== undefined) {
        var workspacePath = workspace[0].uri.fsPath;
        if (!UnityProjectController.isUnityProject(workspacePath)) return;

        await UnityProjectController.initialize(workspacePath);
        
        ProviderController.initialize(context);
        
        CommandController.updateStatus<boolean>('clover.workspace.valid', true);
        // CommandController.updateStatus<boolean>('clover.unity.initialized', true);

        CommandController.initialize(context, workspacePath);
    }
}

