import * as vscode from 'vscode';
import { initialize } from './initializer';
import { UnityAssetConnector } from './parser/assetConnector';

export function activate(context: vscode.ExtensionContext) {
	initialize(context);
    
    // Test
    UnityAssetConnector.registerFileOpenHandler(context);
    
	vscode.commands.executeCommand('workbench.view.extension.clover-activitybar');
}