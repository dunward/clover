import * as vscode from 'vscode';
import * as Hierarchy from './hierarchy';
import * as CommandController from '../controller/commandController';
import * as VSCodeUtils from '../vscodeUtils';
import path = require('path');

export function init(context: vscode.ExtensionContext) {
    CommandController.registerCommand(context, 'clover.showUnityAssetViewer', () => UnityAssetViewer.show(context, VSCodeUtils.getActiveFilePath()));

    vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
        const fileName = document.fileName;
        if (fileName.endsWith(".prefab") || fileName.endsWith(".unity")) {
            vscode.window.showInformationMessage(`This file can be open with unity asset viewer. Do you want to open this file?`, 'YES').then((selection) => {
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
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
            }
        );

        panel.webview.html = this.getLoadingHtml();

        const fontUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'clover-icon.woff'))
        const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'assetViewer.css'))
        const jsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'assetViewer.js'))
        
        panel.webview.html = this.getHtmlForWebview(path, fontUri, cssUri, jsUri);
    }

    private static getLoadingHtml() {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
            HI
            </body>
        `;
    }

    private static getHtmlForWebview(filePath: string, fontUri: vscode.Uri, hierarchyCss: vscode.Uri, assetViewerJs: vscode.Uri) {
        var datas = Hierarchy.initialize(filePath);
        var transforms = Hierarchy.getTransforms();
        var trees = transforms.map((transform) => {
            return Hierarchy.getHierarchyHtmlTreeBase(transform.fileId, Hierarchy.getTransformGameObject(transform)?.m_Name ?? "Unknown Object", Hierarchy.getTransform(transform)?.m_GameObject.fileID ?? "-1");
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
                        <h2>Hierarchy</h2>
                        <h3><span class="icon">&#xe902;</span> ${path.basename(filePath)}</h3>
                        <ul id="hierarchy">
                        <li>
                            ${trees.join('')}
                        </li>
                    </div>
                    <div class="right">
                        <h2>Inspector (read-only)</h2>
                        <div class="inspector" id="inspector">
                        </div>
                    </div>
				</div>
                <script>
                    initialize(${JSON.stringify(Object.fromEntries([...datas]), (key, value) => typeof(value) === 'bigint' ? value.toString() : value)});
                    updateHierarchy(${JSON.stringify(transforms, (key, value) => typeof(value) === 'bigint' ? value.toString() : value)});
                </script>
            </script>
			</body>
			</html>`;
    }
}