import * as vscode from 'vscode';
import * as parser from '../guidParser';
import fs = require('fs');
import path = require('path');

export class MainViewProvider implements vscode.WebviewViewProvider {
    private _extensionUri: vscode.Uri;
    // private _projectName: string;
    // private _projectVersion: string;

    constructor(extensionUri: vscode.Uri, projectPath: string) {
        this._extensionUri = extensionUri;
        var projectSettingsPath = path.join(projectPath, "ProjectSettings", "ProjectSettings.asset");
        var projectVersionPath = path.join(projectPath, "ProjectSettings", "ProjectVersion.txt");
        // this._projectName = parser.getProjectName(fs.readFileSync(projectSettingsPath, { encoding: 'utf8' }));
        // this._projectVersion = parser.getProjectVersion(fs.readFileSync(projectVersionPath, { encoding: 'utf8' }));

    }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken) {
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `
            <html>
            <body>
            
            </body>
            </html>`;
    }
}