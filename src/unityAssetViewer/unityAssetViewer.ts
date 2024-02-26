import * as vscode from 'vscode';

export function init() {
    vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
        const fileName = document.fileName;
        if (fileName.endsWith(".prefab") || fileName.endsWith(".unity")) {
            vscode.window.showInformationMessage(`Open prefab, unity! Want to show this file with asset viewer?`, 'YES').then((selection) => {
                if (selection === 'YES') {
                    UnityAssetViewer.show();
                }
            
            });
        }
    });
}

class UnityAssetViewer {
    public static readonly viewType = 'unityAssetViewer';

    private extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
    }

    public static show() {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        const panel = vscode.window.createWebviewPanel(
            this.viewType,
            'Unity Asset Viewer',
            column || vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                // localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        panel.webview.html = this.getHtmlForWebview();
    }

    private static getHtmlForWebview() {
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body>
				<h1>codicons</h1>
				<div id="icons">
                
				</div>
			</body>
			</html>`;
    }
}