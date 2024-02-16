import * as vscode from 'vscode';
import * as parser from '../parser';
import fs = require('fs');

export class MainViewProvider implements vscode.WebviewViewProvider {
    private _extensionUri: vscode.Uri;
    private _projectName: string;
    private _projectVersion: string;

    constructor(extensionUri: vscode.Uri, projectPath: vscode.Uri) {
        this._extensionUri = extensionUri;
        var projectSettingsPath = vscode.Uri.joinPath(projectPath, "ProjectSettings", "ProjectSettings.asset");
        var projectVersionPath = vscode.Uri.joinPath(projectPath, "ProjectSettings", "ProjectVersion.txt");
        this._projectName = parser.getProjectName(fs.readFileSync(projectSettingsPath.path, { encoding: 'utf8' }));
        this._projectVersion = parser.getProjectVersion(fs.readFileSync(projectVersionPath.path, { encoding: 'utf8' }));

    }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken) {
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `
            <html>
            <body>
                <h2>${this._projectName}</h2>
				<h3>${this._projectVersion}</h3>
            </body>
            </html>`;
    }
}