import * as vscode from 'vscode';
import path = require('path');

class unityMessageProvider extends vscode.CodeLens {
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
    private currentHoverProvider?: vscode.Disposable;

    constructor(context: vscode.ExtensionContext) {
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });

        context.subscriptions.push(
            vscode.commands.registerCommand('unity.showMessage', async (methodName: string, range: vscode.Range) => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;
                
                if (this.currentHoverProvider) {
                    this.currentHoverProvider.dispose();
                }

                editor.selection = new vscode.Selection(range.start, range.start);

                const hover = new vscode.Hover([
                    new vscode.MarkdownString('# 테스트 문서입니다'),
                    new vscode.MarkdownString('이것은 테스트 문서의 내용입니다.')
                ], range);

                this.currentHoverProvider = vscode.languages.registerHoverProvider('*', {
                    provideHover: () => hover
                });

                await vscode.commands.executeCommand('editor.action.showHover');
            })
        );
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
                this.codeLenses.push(new unityMessageProvider(
                    documentUri,
                    symbol.name,
                    new vscode.Range(symbol.range.start, symbol.range.start)
                ));
            }

            if (symbol.children.length > 0) {
                this.addMethodSymbols(symbol.children, documentUri);
            }
        }
    }

    public resolveCodeLens(codeLens: unityMessageProvider, token: vscode.CancellationToken) {
        codeLens.command = {
            title: `$(unity-symbol) Unity Message`,
            command: 'unity.showMessage',
            arguments: [codeLens.methodName, codeLens.range]
        };
        return codeLens;
    }
} 