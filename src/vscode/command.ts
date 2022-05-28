import * as vscode from 'vscode';
import { syncUnityFiles, findFileReference } from '../loader';

export function updateStatus<T>(name: string, value: T) {
    vscode.commands.executeCommand('setContext', name, value);
}

export function initialize(context: vscode.ExtensionContext) {
    registerCommand(context, 'clover.findFileReference', () => findFileReference());
	registerCommand(context, 'clover.syncUnityFiles', () => syncUnityFiles());
}

function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any) {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}