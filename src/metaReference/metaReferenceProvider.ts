import * as vscode from 'vscode';
import * as GuidConnector from '../parser/guidConnector';
import * as Logger from '../vscodeUtils';
import * as CommandController from '../controller/commandController';
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

	constructor(context: vscode.ExtensionContext) {
		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});

		CommandController.registerCommand(context, "clover.findMetaReference", () => this.showReferences());

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
		const guid = GuidConnector.getGuidByPath(codeLens.file);
		var locations = GuidConnector.getLocationsByGuid(guid);
		var length = locations?.length || 0;
		
		codeLens.command = {
			title: this.getTitle(length),
			command: length == 0 ? "clover.noReferenceMessage" : "editor.action.showReferences",
			arguments: [codeLens.document, codeLens.range.start, locations],
		};
		return codeLens;
	}

	showReferences() {
		var activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			const document = activeEditor.document;
			const filePath = document.uri.fsPath;
			const guid = GuidConnector.getGuidByPath(filePath);
			var locations = GuidConnector.getLocationsByGuid(guid);
			var length = locations?.length || 0;

			if (length > 0) {
				vscode.commands.executeCommand("editor.action.showReferences", document.uri, new vscode.Position(0, 0), locations);
			} else {
				vscode.commands.executeCommand("clover.noReferenceMessage");
			}
		}
	}

	getTitle(length: number): string {	
		if (length <= 1) {
			return `$(unity-symbol) ${length} meta reference`;
		} else {
			return `$(unity-symbol) ${length} meta references`;
		}
	}
}