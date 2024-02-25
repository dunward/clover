import * as vscode from 'vscode';
import * as UnityAssetConnector from './unityAssetConnector';
import * as unityProjectController from '../controller/unityProjectController';

interface TreeItemData {
    filePath: string;
}

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

    getChildren(): Thenable<UnityAssetTreeItem[]> {
        return Promise.resolve(this.items);
    }

    addItem(label: string): void {
        const item = new UnityAssetTreeItem(label, vscode.TreeItemCollapsibleState.None);
        this.items.push(item);
        this.refresh();
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
        public readonly data?: TreeItemData,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);

        if (data) {
            this.resourceUri = vscode.Uri.file(data.filePath);
        }

        this.tooltip = this.label;
        this.description = '';
    }
}
  
export class UnityAssetExplorer {
    private unityAssetProvider: UnityAssetProvider;
    private unityAssetTreeView: vscode.TreeView<UnityAssetTreeItem>;

	constructor(context: vscode.ExtensionContext) {
        this.unityAssetProvider = new UnityAssetProvider();
        this.unityAssetTreeView = vscode.window.createTreeView('clover.metaExplorer', { treeDataProvider: this.unityAssetProvider });
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