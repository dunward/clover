import * as vscode from 'vscode';
import path = require('path');
import * as fs from 'fs';

interface UnityMethodPattern {
    pattern: string;
    documentation: string;
}

interface UnityMessagesConfig {
    methodPatterns: UnityMethodPattern[];
}

class unityMessageProvider extends vscode.CodeLens {
    constructor(
        public document: vscode.Uri,
        public methodName: string,
        public documentation: string,
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
    private methodPatterns: UnityMethodPattern[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.loadMethodPatterns(context);

        vscode.workspace.onDidChangeConfiguration((_) => {
            this.loadMethodPatterns(context);
            this._onDidChangeCodeLenses.fire();
        });

        context.subscriptions.push(
            vscode.commands.registerCommand('unity.showMessage', async (methodName: string, documentation: string, range: vscode.Range) => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;
                
                if (this.currentHoverProvider) {
                    this.currentHoverProvider.dispose();
                }

                editor.selection = new vscode.Selection(range.start, range.start);

                const hover = new vscode.Hover([
                    new vscode.MarkdownString(documentation)
                ], range);

                this.currentHoverProvider = vscode.languages.registerHoverProvider('*', {
                    provideHover: () => hover
                });

                await vscode.commands.executeCommand('editor.action.showHover');
            })
        );
    }

    private loadMethodPatterns(context: vscode.ExtensionContext) {
        const configPath = path.join(context.extensionPath, 'src', 'unityReference', 'unityMessages.json');
        try {
            const configContent = fs.readFileSync(configPath, 'utf8');
            const config: UnityMessagesConfig = JSON.parse(configContent);
            this.methodPatterns = config.methodPatterns;
        } catch (error) {
            console.error('Failed to load Unity messages configuration:', error);
            this.methodPatterns = [];
        }
    }

    private isUnityMethod(methodName: string): UnityMethodPattern | undefined {
        return this.methodPatterns.find(pattern => 
            new RegExp(pattern.pattern).test(methodName)
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
                const documents = vscode.workspace.textDocuments;
                const document = documents.find(doc => doc.uri.toString() === documentUri.toString());
                if (!document) {
                    return;
                }
                const line = document.lineAt(symbol.range.start.line).text.trim();
                const methodPattern = this.isUnityMethod(line);
                if (methodPattern) {
                    this.codeLenses.push(new unityMessageProvider(
                        documentUri,
                        symbol.name,
                        methodPattern.documentation,
                        new vscode.Range(symbol.range.start, symbol.range.start)
                    ));
                }
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
            arguments: [codeLens.methodName, codeLens.documentation, codeLens.range]
        };
        return codeLens;
    }
} 