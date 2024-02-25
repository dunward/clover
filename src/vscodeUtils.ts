import * as vscode from 'vscode';

let clover = vscode.window.createOutputChannel("Clover");

export function outputLog(log: string) {
    clover.appendLine(`[${new Date().toLocaleTimeString()}] ${log}`);
}

export function insertText(text: string) {
    const editor = vscode.window.activeTextEditor;
    editor?.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, text);
    });
}

export function getWorkspacePath(): string {
    return vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
}