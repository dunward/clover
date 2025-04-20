import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');

export class MainViewProvider implements vscode.WebviewViewProvider {
    private _extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;
    }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const logoPath = vscode.Uri.joinPath(this._extensionUri, 'resources', 'clover.png');
        const logoUri = webview.asWebviewUri(logoPath);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        padding: 20px;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 20px;
                        justify-content: center;
                    }
                    .logo {
                        width: 40px;
                        height: 40px;
                        object-fit: contain;
                    }
                    .title {
                        font-size: 28px;
                        font-weight: bold;
                        margin: 0;
                    }
                    a {
                        color: var(--vscode-textLink-foreground);
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                    }
                    .github-icon {
                        width: 24px;
                        height: 24px;
                        transition: transform 0.2s;
                        fill: var(--vscode-foreground);
                    }
                    .contribute-section {
                        margin-top: 20px;
                        padding: 0 6px;
                    }
                    .contribute-text {
                        font-size: 13px;
                        color: var(--vscode-foreground);
                        opacity: 0.8;
                        margin-bottom: 8px;
                        line-height: 1.4;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${logoUri}" alt="Clover Logo" class="logo">
                    <h1 class="title">Clover</h1>
                </div>
                <div class="contribute-section">
                    <p class="contribute-text">Have ideas for VS Code extensions that could enhance Unity development?<br>Feel free to contribute to Clover!</p>
                    <a href="https://github.com/dunward/clover" title="GitHub Repository">
                        <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z"></path></svg>
                    </a>
                </div>
            </body>
            </html>`;
    }
}