import * as vscode from 'vscode';
import { refreshUnityProject, findMetaReference } from '../loader';

export function updateStatus<T>(name: string, value: T) {
    vscode.commands.executeCommand('setContext', name, value);
}

export function initialize(context: vscode.ExtensionContext) {
    registerCommand(context, 'clover.findMetaReference', () => findMetaReference());
	registerCommand(context, 'clover.refreshUnityProject', () => refreshUnityProject());
}

function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any) {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}