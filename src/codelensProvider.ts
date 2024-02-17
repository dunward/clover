import * as vscode from 'vscode';
import path = require("path");
import * as parser from './parser';
import * as loader from './loader';
import { outputLog } from './logger';
import { MetaData } from './metaData';

class MetaReferenceCodeLens extends vscode.CodeLens {
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
				this.codeLenses.push(new MetaReferenceCodeLens(document.uri, document.uri.fsPath, line.range));
			}
			return this.codeLenses;
	}

	public resolveCodeLens(codeLens: MetaReferenceCodeLens, token: vscode.CancellationToken) {
		var guid = parser.getGuid(`${codeLens.document.fsPath}.meta`);
		var metaDatas = loader.getMetaData(guid);

		var locations = this.getLocations(metaDatas);

		codeLens.command = {
			title: this.getTitle(metaDatas),
			command: metaDatas.length == 0 ? "clover.noReferenceMessage" : "editor.action.showReferences",
			arguments: [codeLens.document, new vscode.Position(0, 0), locations],
		};
		return codeLens;
	}

	getTitle(metaDatas: MetaData[]): string {
		if (metaDatas.length <= 1) {
			return `${metaDatas.length} meta reference`;
		} else {
			return `${metaDatas.length} meta references`;
		}
	}

	getLocations(metaDatas: MetaData[]): vscode.Location[] {
		return metaDatas.map(CodelensProvider.metaDataToLocation);
	}

	static metaDataToLocation(metaData: MetaData): vscode.Location {
		console.log(metaData.path);
		const uri = vscode.Uri.parse(metaData.path);
		console.log(uri.toString());
		const position = new vscode.Position(0, 0); // 예시로 첫 번째 줄의 첫 번째 열을 사용
		return new vscode.Location(uri, position);
	}
}