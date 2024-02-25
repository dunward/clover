import * as vscode from 'vscode';
import * as UnityAssetConnector from './unityAssetConnector';
import * as unityProjectController from '../controller/unityProjectController';
import path = require('path');
import * as VSCodeUtils from '../vscodeUtils';

class UnityAssetProvider implements vscode.TreeDataProvider<UnityAssetTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<UnityAssetTreeItem | undefined> = new vscode.EventEmitter<UnityAssetTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<UnityAssetTreeItem | undefined> = this._onDidChangeTreeData.event;

    private items: UnityAssetTreeItem[] = [];

    refresh(element?: UnityAssetTreeItem): void {
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: UnityAssetTreeItem): vscode.TreeItem {
        return element;
    }

    addItem(item: string): void {
        var replativePath = path.relative(VSCodeUtils.getWorkspacePath(), item);
        const parts = replativePath.split(path.sep);
        let currentItems = this.items;
    
        parts.forEach((part, index) => {
            let item = currentItems.find(item => item.label === part && item.depth === index);
    
            if (!item) {
                item = new UnityAssetTreeItem(
                    part,
                    index < parts.length - 1 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                    index
                );
                currentItems.push(item);
            }
    
            if (!item.children) {
                item.children = [];
            }
    
            currentItems = item.children;
        });
    
        this.refresh();
    }

    getChildren(element?: UnityAssetTreeItem): Thenable<UnityAssetTreeItem[]> {
        if (element) {
            return Promise.resolve(element.children ?? []);
        } else {
            return Promise.resolve(this.items);
        }
    }

    clearItems(): void {
        this.items = [];
        this.refresh();
    }
}

class UnityAssetTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly depth: number,
        public children?: UnityAssetTreeItem[]
    ) {
        super(label, collapsibleState);

        if (path.parse(label).ext === '.unity')
            this.iconPath = new vscode.ThemeIcon("unity-symbol");
        else if (path.parse(label).ext === '.prefab')
            this.iconPath = new vscode.ThemeIcon("unity-prefab");
        this.label = label;
        this.tooltip = this.label;
        this.description = '';
        if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.children = undefined;
        } else {
            this.children = children ? children : [];
        }
    }
}
  
export class UnityAssetExplorer {
    private unityAssetProvider: UnityAssetProvider;
    private unityAssetTreeView: vscode.TreeView<UnityAssetTreeItem>;

	constructor(context: vscode.ExtensionContext) {
        this.unityAssetProvider = new UnityAssetProvider();
        this.unityAssetTreeView = vscode.window.createTreeView('clover.unityAssetExplorer', { treeDataProvider: this.unityAssetProvider });
        this.refresh();
		context.subscriptions.push(this.unityAssetTreeView);
        unityProjectController.addRefreshEndCallback(() => this.refresh());
    }

    public refresh(): void {
        this.unityAssetProvider.clearItems();
        UnityAssetConnector.getAssetPaths().forEach((filePath) => {
            this.unityAssetProvider.addItem(filePath);
        });
    }
}