import * as vscode from 'vscode';
import { initialize } from './initializer';

export function activate(context: vscode.ExtensionContext) {
	initialize(context);
}

export function deactivate() {}
