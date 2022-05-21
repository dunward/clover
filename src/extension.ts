// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "clover" is now active!');

	let clover = vscode.window.createOutputChannel("Clover");

	clover.appendLine("hello world!");

	if (!vscode.workspace.workspaceFolders) {
        vscode.window.showInformationMessage("Open a folder/workspace first");
        return;
    }

	let workspace = vscode.workspace.workspaceFolders[0].uri.fsPath;
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('clover.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		vscode.window.showInformationMessage('Hello World from clover!');
		fs.readdir(workspace, (err, files) => {
			files.forEach(file => {
				clover.appendLine(file);
			});
		});
	});

	// vscode.window.createTreeView('clover', {

	// });

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
