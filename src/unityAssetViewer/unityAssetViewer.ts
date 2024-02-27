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
        const hierarchyCss = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'hierarchy.css'))
        panel.webview.html = this.getHtmlForWebview(path, fontUri, hierarchyCss);
    }

    private static hierarchyBase(fileId: string, name: string) {
        return `
        <li>
            <div class="hierachy-object"><span class="icon">&#xe900;</span>${name}</div>
            <ul classId="${fileId}">
            </ul>
        </li>
        `;
    }

    private static getHtmlForWebview(path: string, fontUri: vscode.Uri, hierachyCss: vscode.Uri) {
        var parser = new UnityYamlParser(path);
        var list = parser.getYamlDataList();
        const gameObjects = list.filter((item) => item.classId == "1");
        var test = gameObjects.map((item) => {
            return this.hierarchyBase(item.fileId, item.data.GameObject.m_Name);
        });
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${fontUri}" rel="stylesheet">
                <link href="${hierachyCss}" rel="stylesheet">

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
                        <li>
                            ${test.join('')}
                        </li>
                    </div>
                    <div class="right">
                        <h2>Inspector</h1>
                    </div>
				</div>
			</body>
			</html>`;
    }
}