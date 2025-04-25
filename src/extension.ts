import * as vscode from 'vscode';
import { initialize } from './initializer';
import { registerFileOpenHandler } from './parser/assetConnector';

export function activate(context: vscode.ExtensionContext) {
	initialize(context);
    
    // Test
    registerFileOpenHandler(context);
    
	vscode.commands.executeCommand('workbench.view.extension.clover-activitybar');
}