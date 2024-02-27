import * as vscode from 'vscode';
import { UnityYamlParser } from 'unity-yaml-parser';

export function init(context: vscode.ExtensionContext) {
    vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
        const fileName = document.fileName;
        if (fileName.endsWith(".prefab") || fileName.endsWith(".unity")) {
            vscode.window.showInformationMessage(`Open prefab, unity! Want to show this file with asset viewer?`, 'YES').then((selection) => {
                if (selection === 'YES') {
                    UnityAssetViewer.show(context, fileName);
                }
            
            });
        }
    });
}

class UnityAssetViewer {
    public static readonly viewType = 'unityAssetViewer';

    public static show(context: vscode.ExtensionContext, path: string) {
        const extensionUri = context.extensionUri;
        const panel = vscode.window.createWebviewPanel(
            this.viewType,
            'Unity Asset Viewer',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        const fontUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'clover-icon.woff'))
        panel.webview.html = this.getHtmlForWebview(path, fontUri);
    }

    private static getHtmlForWebview(path: string, fontUri: vscode.Uri) {
        var parser = new UnityYamlParser(path);
        var list = parser.getYamlDataList();
        console.log(list);
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

                <style>
                    @font-face {
                        font-family: 'clover-icon';
                        src: url('${fontUri}') format('woff');
                    }

                    div {
                        width: 100%;
                        height: 100%;
                    }

                    div.left {
                        width: 50%;
                        float: left;
		                overflow-y: auto;
                    }

                    div.right {
                        width: 50%;
                        float: right;
                        overflow-y: auto;
                    }

                    .hierachy-object {
                        font-size: 14px;
                        width: 200px;
                        border: 1px solid black;
                    }

                    ul {
                        list-style-type: none;
                        margin: 0;
                        padding: 0;
                    }

                    .icon {
                        font-family: 'clover-icon';
                    }
                </style>
			</head>
			<body>
				<div>
                    <div class="left">
                        <h2>Hierachy</h1>
                        <ul id="hierachy">
                            <li><div class="hierachy-object"><span class="icon">&#xe900;</span>asd</div></li>
                        </ul>
                    </div>
                    <div class="right">
                        <h2>Inspector</h1>
                    </div>
				</div>
			</body>
			</html>`;
    }
}