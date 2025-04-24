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

                this.currentHoverProvider = vscode.languages.registerHoverProvider({ scheme: 'file', language: 'csharp' }, {
                    provideHover: (document, position, token) => {
                        if (range.contains(position)) {
                            return hover;
                        }
                        return null;
                    }
                });

                await vscode.commands.executeCommand('editor.action.showHover');
            })
        );
    }

    private loadMethodPatterns(context: vscode.ExtensionContext) {
        const configPath = path.join(context.extensionPath, 'unityMessages.json');
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

        const text = document.getText();
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const methodPattern = this.isUnityMethod(line);
            
            if (methodPattern) {
                const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
                const range = new vscode.Range(
                    new vscode.Position(i, indent),
                    new vscode.Position(i, lines[i].length)
                );
                
                this.codeLenses.push(new unityMessageProvider(
                    document.uri,
                    lines[i].trim(),
                    methodPattern.documentation,
                    range
                ));
            }
        }

        return this.codeLenses;
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