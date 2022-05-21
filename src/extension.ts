// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { syncUnityFiles, findPrefabReference } from './loader';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Open a folder/workspace first");
        return;
    }
	
	let workspace = vscode.workspace.workspaceFolders[0].uri.fsPath + '\\Assets';

	syncUnityFiles(workspace);
	
	let find = vscode.commands.registerCommand('clover.findPrefabReference', () => {
		findPrefabReference();
	});

	context.subscriptions.push(find);
}

// this method is called when your extension is deactivated
export function deactivate() {}
