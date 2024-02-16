import * as vscode from 'vscode';
import { initialize } from './initializer';
import { MetaExplorer } from './metaExplorer';
const path = require('path');

export function activate(context: vscode.ExtensionContext) {
	new MetaExplorer(context);
	initialize(context);
    vscode.commands.executeCommand('workbench.view.extension.clover-activitybar');
}