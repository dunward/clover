import * as vscode from 'vscode';
import { initialize } from './initializer';
import { UnityMetaDataParser } from './parser/unityMetaDataParser';

export function activate(context: vscode.ExtensionContext) {
	initialize(context);
    
    // Test
    UnityMetaDataParser.registerFileOpenHandler(context);
    
	vscode.commands.executeCommand('workbench.view.extension.clover-activitybar');
}