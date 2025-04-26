import * as vscode from 'vscode';
import path = require('path');
import * as fs from 'fs';
import { validateMethod } from '../parser/assetConnector';

class unityUsageProvider extends vscode.CodeLens {
    constructor(
        public document: vscode.Uri,
        public methodName: string,
        public usageInfo: any,
        range: vscode.Range
    ) {
        super(range);
    }
}

export class UnityUsageProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor(context: vscode.ExtensionContext) {
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });

        context.subscriptions.push(
            vscode.commands.registerCommand('unity.showUsage', async (methodName: string, usageInfo: any, range: vscode.Range) => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;

                const references: vscode.Location[] = usageInfo.locations.map((location: any) => {
                    return new vscode.Location(
                        vscode.Uri.file(location.filePath),
                        new vscode.Position(location.lineNumber - 1, 0)
                    );
                });

                if (references.length > 0) {
                    await vscode.commands.executeCommand(
                        'editor.action.showReferences',
                        editor.document.uri,
                        range.start,
                        references
                    );
                } else {
                    vscode.window.showInformationMessage('No references found.');
                }
            })
        );
    }

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        this.codeLenses = [];
        const text = document.getText();

        let namespace = '';
        const namespaceMatch = text.match(/namespace\s+([^\s{]+)/);
        if (namespaceMatch) {
            namespace = namespaceMatch[1];
        }

        let currentClass = '';
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                currentClass = classMatch[1];
            }

            const methodMatch = line.match(/(?:public|private|protected)\s+(?:static\s+)?(?:async\s+)?[\w<>[\]]+\s+(\w+)\s*\([^)]*\)/);
            if (methodMatch && currentClass) {
                const methodName = methodMatch[1];
                const fullName = `${namespace}.${currentClass}.${methodName}`;
                
                const usageInfo = validateMethod(namespace, currentClass, methodName);
                if (usageInfo.foundIn.length > 0) {
                    const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
                    const range = new vscode.Range(
                        new vscode.Position(i, indent),
                        new vscode.Position(i, lines[i].length)
                    );
                    
                    this.codeLenses.push(new unityUsageProvider(
                        document.uri,
                        fullName,
                        usageInfo,
                        range
                    ));
                }
            }
        }

        return this.codeLenses;
    }

    public resolveCodeLens(codeLens: unityUsageProvider, token: vscode.CancellationToken) {
        codeLens.command = {
            title: this.getTitle(codeLens.usageInfo.foundIn.length),
            command: 'unity.showUsage',
            arguments: [
                codeLens.methodName,
                codeLens.usageInfo,
                codeLens.range
            ]
        };
        return codeLens;
    }

    getTitle(length: number): string {	
		if (length <= 1) {
			return `${length} usage`;
		} else {
			return `${length} usages`;
		}
	}
} 