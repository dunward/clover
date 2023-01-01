import * as vscode from 'vscode';
import path = require("path");
import { outputLog } from './logger';

export class CodelensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		let file = vscode.window.activeTextEditor?.document.uri.fsPath;
		
		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});

		outputLog("Initialize succeed CodeLens Provider");
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
			this.codeLenses = [];
			outputLog("beefore prase");
			outputLog(path.parse(document.uri.fsPath).name);
			outputLog("WHy");
			const regex = new RegExp(`class ${path.parse(document.uri.fsPath).name}`);
			const text = document.getText();
			let matches;
			if ((matches = regex.exec(text)) !== null) {
				const line = document.lineAt(document.positionAt(matches.index).line);
				this.codeLenses.push(new vscode.CodeLens(line.range));
			}
			return this.codeLenses;
	}

	public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
		codeLens.command = {
			title: "meta references",
			command: "clover.unity.codeLensAction",
			arguments: ["Argument 1", false]
		};
		return codeLens;
	}
}