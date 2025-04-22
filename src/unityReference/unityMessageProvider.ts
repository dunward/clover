import * as vscode from 'vscode';
import path = require('path');

class NamespaceCodeLens extends vscode.CodeLens {
    constructor(
        public document: vscode.Uri,
        public methodName: string,
        range: vscode.Range
    ) {
        super(range);
    }
}

export class UnityMessageProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor(context: vscode.ExtensionContext) {
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        this.codeLenses = [];

        const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider',
            document.uri
        );

        if (symbols) {
            this.addMethodSymbols(symbols, document.uri);
        }

        return this.codeLenses;
    }

    private addMethodSymbols(symbols: vscode.DocumentSymbol[], documentUri: vscode.Uri) {
        for (const symbol of symbols) {
            if (symbol.kind === vscode.SymbolKind.Method) {
                this.codeLenses.push(new NamespaceCodeLens(
                    documentUri,
                    symbol.name,
                    symbol.range
                ));
            }

            if (symbol.children.length > 0) {
                this.addMethodSymbols(symbol.children, documentUri);
            }
        }
    }

    public resolveCodeLens(codeLens: NamespaceCodeLens, token: vscode.CancellationToken) {
        codeLens.command = {
            title: `$(unity-symbol) Unity Message`,
            command: 'unity.showMessage',
            arguments: [codeLens.methodName]
        };
        return codeLens;
    }
} 