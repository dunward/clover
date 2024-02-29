import * as vscode from 'vscode';
import * as UnityYamlParser from 'unity-yaml-parser';

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
        const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'assetViewer.css'))
        const jsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'assetViewer.js'))
        panel.webview.html = this.getHtmlForWebview(path, fontUri, cssUri, jsUri);
    }

    private static hierarchyBase(fileId: string, name: string) {
        return `
        <li id="${fileId}">
            <div class="hierarchy-object"><span class="icon">&#xe900;</span>${name}</div>
            <ul id="${fileId}-children">
            </ul>
        </li>
        `;
    }

    private static getHtmlForWebview(path: string, fontUri: vscode.Uri, hierarchyCss: vscode.Uri, assetViewerJs: vscode.Uri) {
        var datas = UnityYamlParser.parse(path);
        var gameObjects = datas.filter((item) => item.classId == "1");
        var transforms = datas.filter((item) => (item.classId == "4" || item.classId == "224"));
        
        var test = transforms.map((item) => {
            const name = gameObjects.find((gameObject) => 
            {
                if (item.classId == "4")
                {
                    return gameObject.fileId == item.data.Transform.m_GameObject?.fileID;
                }
                else
                {
                    return gameObject.fileId == item.data.RectTransform.m_GameObject?.fileID;
                }
            }
            )?.data.GameObject.m_Name ?? "Unknown";
            if (name == "Unknown") console.log(item);
            return this.hierarchyBase(item.fileId, name);
        });

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${fontUri}" rel="stylesheet">
                <link href="${hierarchyCss}" rel="stylesheet">
                <script src="${assetViewerJs}"></script>
			</head>
			<body>
				<div>
                    <div class="left">
                        <h2>hierarchy</h1>
                        <ul id="hierarchy">
                        <li>
                            ${test.join('')}
                        </li>
                    </div>
                    <div class="right">
                        <h2>Inspector</h1>
                    </div>
				</div>
                <script>
                    updateHierarchy(${JSON.stringify(transforms)});
                </script>
            </script>
			</body>
			</html>`;
    }
}