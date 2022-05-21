// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { syncUnityFiles } from './file';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Open a folder/workspace first");
        return;
    }
	
	let workspace = vscode.workspace.workspaceFolders[0].uri.fsPath + '\\Assets';
	
	let sync = vscode.commands.registerCommand('clover.findPrefabReference', () => {
		syncUnityFiles(workspace);
	});

	context.subscriptions.push(sync);
}

// this method is called when your extension is deactivated
export function deactivate() {}
