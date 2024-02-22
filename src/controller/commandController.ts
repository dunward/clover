import * as vscode from 'vscode';
import path = require('path');
import { refreshUnityProject } from './unityProjectController';

export function updateStatus<T>(name: string, value: T) {
    vscode.commands.executeCommand('setContext', name, value);
}

export function initialize(context: vscode.ExtensionContext, workspacePath: string) {
    const assetPath = path.join(workspacePath, 'Assets');
	registerCommand(context, 'clover.refreshUnityProject', () => refreshUnityProject(assetPath));
	registerCommand(context, 'clover.noReferenceMessage', () => vscode.window.showInformationMessage("No reference found"));
}

function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any) {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}