import * as vscode from 'vscode';

export function updateStatus<T>(name: string, value: T) {
    vscode.commands.executeCommand('setContext', name, value);
}