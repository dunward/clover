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
        const hierarchyCss = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'hierarchy.css'))
        panel.webview.html = this.getHtmlForWebview(path, fontUri, hierarchyCss);
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

    private static getHtmlForWebview(path: string, fontUri: vscode.Uri, hierarchyCss: vscode.Uri) {
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
            return this.hierarchyBase(item.fileId, name);
        });

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${fontUri}" rel="stylesheet">
                <link href="${hierarchyCss}" rel="stylesheet">

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
                        font-size: 16px;
                    }
                </style>
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
                const transforms = ${JSON.stringify(transforms)};
                const hierarchy = document.getElementById('hierarchy');
                
                function updateHierarchy() {
                    transforms.forEach(transform => {
                        let fatherId;
                        let gameObjectId;
                        if (transform.classId == "4")
                        {
                            gameObjectId = transform.fileId;
                            fatherId = transform.data.Transform.m_Father?.fileID ?? -1;
                        }
                        else
                        {
                            console.log(transform.data.RectTransform);
                            gameObjectId = transform.fileId;
                            fatherId = transform.data.RectTransform.m_Father?.fileID ?? -1;
                        }

                        console.log("I'm " + gameObjectId + "my father is " + fatherId);

                        if (fatherId == -1 || gameObjectId == -1) return;
                        if (fatherId == 0) return;

                        const gameObjectElement = document.getElementById(gameObjectId);
                        console.log(gameObjectElement);
                        
                        if (gameObjectElement) {
                            const fatherElement = document.getElementById(fatherId + "-children");
                            if (fatherElement) {
                                fatherElement.appendChild(gameObjectElement);
                            } else {
                                hierarchy.appendChild(gameObjectElement);
                            }
                        }
                    });
                }
                
                updateHierarchy();
            </script>
			</body>
			</html>`;
    }
}