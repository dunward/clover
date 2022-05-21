import * as vscode from 'vscode';

let clover = vscode.window.createOutputChannel("Clover");

export function outputLog(log: string) {
    clover.appendLine(`[${new Date().toLocaleTimeString()}] ${log}`);
}