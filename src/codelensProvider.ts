import * as vscode from 'vscode';
import path = require("path");
import { outputLog } from './logger';

export class AssetUsageCodeLens extends vscode.CodeLens {
	constructor(
		public document: vscode.Uri,
		public file: string,
		range: vscode.Range
	) {
		super(range);
	}
}

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
			const regex = new RegExp(`class ${path.parse(document.uri.fsPath).name}`);
			const text = document.getText();
			let matches;
			if ((matches = regex.exec(text)) !== null) {
				const line = document.lineAt(document.positionAt(matches.index).line);
				this.codeLenses.push(new vscode.CodeLens(line.range));
			}
			return this.codeLenses.map((codeLens) => new AssetUsageCodeLens(document.uri, document.uri.fsPath, codeLens.range));
	}

	public resolveCodeLens(codeLens: AssetUsageCodeLens, token: vscode.CancellationToken) {
		codeLens.command = {
			title: "meta references",
			command: "editor.action.showReferences",
			arguments: [codeLens.document, new vscode.Position(0, 0), [new vscode.Location(codeLens.document, new vscode.Position(0, 0)), new vscode.Location(codeLens.document, new vscode.Position(1, 0))]]
		};
		return codeLens;
	}
}