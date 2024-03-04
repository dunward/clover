import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');

export class MainViewProvider implements vscode.WebviewViewProvider {
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
                <h2>Clover for unity</h1>
                <a href="https://github.com/novemberi/clover">Github</a>
            </body>
            </html>`;
    }
}