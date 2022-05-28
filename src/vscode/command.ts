import * as vscode from 'vscode';

export function updateStatus() {
    vscode.commands.executeCommand('setContext', 'clover.initialized', true);
}