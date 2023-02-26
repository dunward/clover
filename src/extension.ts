import * as vscode from 'vscode';
import { initialize } from './initializer';
import { MetaExplorer } from './metaExplorer';

export function activate(context: vscode.ExtensionContext) {
	new MetaExplorer(context);
	initialize(context);
}
