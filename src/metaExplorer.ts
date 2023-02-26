import * as vscode from 'vscode';

interface TreeItemData {
    filePath: string;
}

class MetaDataProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

    private items: TreeItem[] = [];

    refresh(element?: TreeItem): void {
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(this.items);
    }

    addItem(label: string): void {
        const item = new TreeItem(label, vscode.TreeItemCollapsibleState.None);
        this.items.push(item);
        this.refresh();
    }

    clearItems(): void {
        this.items = [];
        this.refresh();
    }
}

class TreeItem extends vscode.TreeItem {
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
  
export class MetaExplorer {
    private treeDataProvider: MetaDataProvider;
    private treeView: vscode.TreeView<TreeItem>;

	constructor(context: vscode.ExtensionContext) {
        this.treeDataProvider = new MetaDataProvider();
        this.treeView = vscode.window.createTreeView('metaExplorer', { treeDataProvider: this.treeDataProvider });
		context.subscriptions.push(this.treeView);
    }

    public addItem(filePath: string): void {
        this.treeDataProvider.addItem(filePath);
        vscode.commands.executeCommand('metaExplorer');
    }

    public clearItems(): void {
        this.treeDataProvider.clearItems();
    }
}