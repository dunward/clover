import * as vscode from 'vscode';
import { initialize } from './initializer';
import { MetaExplorer } from './metaExplorer';
const path = require('path');

export function activate(context: vscode.ExtensionContext) {
	new MetaExplorer(context);
	initialize(context);
    vscode.commands.executeCommand('workbench.view.extension.clover-activitybar');
    var simple = new SimpleReferenceProvider();
    context.subscriptions.push(vscode.languages.registerReferenceProvider({ language: 'csharp' }, simple));
    context.subscriptions.push(vscode.commands.registerCommand('clover.test', () => {
        console.log('test')
        if (vscode.window.activeTextEditor) {
            console.log('test2');
            var locations = [ new vscode.Location(vscode.window.activeTextEditor.document.uri, new vscode.Position(1, 0)), new vscode.Location(vscode.window.activeTextEditor.document.uri, new vscode.Position(2, 0)) ];
            vscode.commands.executeCommand('editor.action.showReferences', vscode.window.activeTextEditor.document.uri, new vscode.Position(0, 0), locations);
        }
    }));
}

class test implements vscode.ReferenceContext {
    includeDeclaration: boolean;
    /**
     *
     */
    constructor() {
        this.includeDeclaration = true;
    }
}

class test2 implements vscode.CancellationToken {
    isCancellationRequested: boolean;
    onCancellationRequested: vscode.Event<any>;
    constructor() {
        this.isCancellationRequested = false;
        this.onCancellationRequested = new vscode.EventEmitter().event;
    }
}

class SimpleReferenceProvider implements vscode.ReferenceProvider {
    provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
        console.log('test3')

        // Get selected word or symbol
        const wordRange = document.getWordRangeAtPosition(position);
        const selectedWord = wordRange ? document.getText(wordRange) : '';

        // Find references
        const references: vscode.Location[] = [];

        // for (let i = 0; i < document.lineCount; i++) {
        //     const line = document.lineAt(i);
        //     const index = line.text.indexOf(selectedWord);
        //     if (index !== -1) {
        //         const referenceLocation = new vscode.Location(document.uri, new vscode.Range(new vscode.Position(i, index), new vscode.Position(i, index + selectedWord.length)));
        //         references.push(referenceLocation);
        //     }
        // }
        references.push(new vscode.Location(document.uri, new vscode.Position(0, 0)));
        references.push(new vscode.Location(document.uri, new vscode.Position(1, 1)));
        console.log('test4')

        return references;
    }
}