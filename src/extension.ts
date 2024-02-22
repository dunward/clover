import * as vscode from 'vscode';
import { initialize } from './initializer';

export function activate(context: vscode.ExtensionContext) {
	initialize(context);
    vscode.commands.executeCommand('workbench.view.extension.clover-activitybar');
}