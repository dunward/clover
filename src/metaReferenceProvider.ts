import * as vscode from 'vscode';
import * as GuidConnector from './guidConnector';
import * as Logger from './logger';
import path = require('path');

class MetaReferenceCodeLens extends vscode.CodeLens {
	constructor(
		public document: vscode.Uri,
		public file: string,
		range: vscode.Range
	) {
		super(range);
	}
}

export class MetaReferenceProvider implements vscode.CodeLensProvider {
	private codeLenses: vscode.CodeLens[] = [];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});

		Logger.outputLog("Initialize succeed CodeLens Provider");
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
			this.codeLenses = [];
			const regex = new RegExp(`class ${path.parse(document.fileName).name}`);
			const text = document.getText();
			let matches;
			if ((matches = regex.exec(text)) !== null) {
				const line = document.lineAt(document.positionAt(matches.index).line);
				this.codeLenses.push(new MetaReferenceCodeLens(document.uri, document.uri.fsPath,line.range));
			}
			return this.codeLenses;
	}

	public resolveCodeLens(codeLens: MetaReferenceCodeLens, token: vscode.CancellationToken) {
		console.log(codeLens.document);
		const guid = GuidConnector.getGuidByUri(codeLens.document);
		console.log(guid);
		var locations = GuidConnector.getLocationsByUri(guid);
		var length = locations?.length || 0;
		
		codeLens.command = {
			title: this.getTitle(length),
			command: length == 0 ? "clover.noReferenceMessage" : "editor.action.showReferences",
			arguments: [codeLens.document, codeLens.range.start, locations],
		};
		return codeLens;
	}

	getTitle(length: number): string {	
		if (length <= 1) {
			return `$(custom-unity) ${length} meta reference`;
		} else {
			return `$(custom-unity) ${length} meta references`;
		}
	}
}