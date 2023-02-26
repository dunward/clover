import * as vscode from 'vscode';

const tree: any = {
	'a': {
		'aa': {
			'aaa': {
				'aaaa': {
					'aaaaa': {
						'aaaaaa': {

						}
					}
				}
			}
		},
		'ab': {}
	},
	'b': {
		'ba': {},
		'bb': {}
	}
};

class MetaDataProvider implements vscode.TreeDataProvider<MetaExplorer> {
    constructor() {
	}

    getChildren(key: string | undefined): string[] {
        if (!key) {
            return Object.keys(tree);
        }
        const treeElement = this.getTreeElement(key);
        if (treeElement) {
            return Object.keys(treeElement);
        }
        return [];
    }

    getTreeElement(element: string): any {
        let parent = tree;
        for (let i = 0; i < element.length; i++) {
            parent = parent[element.substring(0, i + 1)];
            if (!parent) {
                return null;
            }
        }
        return parent;
    }

    getTreeItem(key: string): vscode.TreeItem {
        const treeElement = this.getTreeElement(key);
        // An example of how to use codicons in a MarkdownString in a tree item tooltip.
        const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${key}`, true);
        return {
            label: /**vscode.TreeItemLabel**/<any>{ label: key, highlights: key.length > 1 ? [[key.length - 2, key.length - 1]] : void 0 },
            tooltip,
            collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        };
    }
}
  
export class MetaExplorer {
	constructor(context: vscode.ExtensionContext) {
        const treeDataProvider = new MetaDataProvider();
		context.subscriptions.push(vscode.window.createTreeView('metaExplorer', { treeDataProvider }));
    }
}