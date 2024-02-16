import * as vscode from 'vscode';
import { initialize } from './initializer';
import { MetaExplorer } from './metaExplorer';
const path = require('path');

export function activate(context: vscode.ExtensionContext) {
	new MetaExplorer(context);

	const cloverProvider = new CloverViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider('clover.mainView', cloverProvider);
    vscode.commands.executeCommand('workbench.view.extension.clover-activitybar');
	initialize(context);
}

class CloverViewProvider implements vscode.WebviewViewProvider {
    private _extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;
    }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken) {
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `
            <html>
            <body>
                <h1>Clover Webview</h1>
				I m h e r e
            </body>
            </html>`;
    }
}