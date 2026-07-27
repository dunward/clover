import * as vscode from 'vscode';
import { initialize } from './initializer';

export async function activate(context: vscode.ExtensionContext) {
	const isUnityProject = await initialize(context);

	if (isUnityProject && !context.globalState.get<boolean>('clover.sidebarShown')) {
		vscode.commands.executeCommand('workbench.view.extension.clover-activitybar');
		context.globalState.update('clover.sidebarShown', true);
	}
}

export function deactivate() {}