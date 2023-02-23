import * as vscode from 'vscode';
import { initialize } from './initializer';

export function activate(context: vscode.ExtensionContext) {
	const treeDataProvider = new MyTreeDataProvider();
	vscode.window.registerTreeDataProvider('myTreeView', treeDataProvider);
	context.subscriptions.push(vscode.window.createTreeView('myTreeView', { treeDataProvider }));

	initialize(context);
}

class MyTreeDataProvider implements vscode.TreeDataProvider<MyTreeNode> {
	onDidChangeTreeData?: vscode.Event<MyTreeNode | null | undefined> | undefined;
  
	getTreeItem(element: MyTreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
	  return {
		label: element.label,
		collapsibleState: element.collapsibleState,
		command: element.command,
	  };
	}
  
	getChildren(element?: MyTreeNode | undefined): vscode.ProviderResult<MyTreeNode[]> {
	  if (!element) {
		return [
		  new MyTreeNode('Folder 1', vscode.TreeItemCollapsibleState.Collapsed, {
			title: 'Open Folder 1',
			command: 'myExtension.openFolder1',
		  }),
		  new MyTreeNode('Folder 2', vscode.TreeItemCollapsibleState.Collapsed, {
			title: 'Open Folder 2',
			command: 'myExtension.openFolder2',
		  }),
		];
	  } else if (element.label === 'Folder 1') {
		return [
		  new MyTreeNode('File 1.1', vscode.TreeItemCollapsibleState.None, {
			title: 'Open File 1.1',
			command: 'myExtension.openFile1.1',
		  }),
		  new MyTreeNode('File 1.2', vscode.TreeItemCollapsibleState.None, {
			title: 'Open File 1.2',
			command: 'myExtension.openFile1.2',
		  }),
		];
	  } else if (element.label === 'Folder 2') {
		return [
		  new MyTreeNode('File 2.1', vscode.TreeItemCollapsibleState.None, {
			title: 'Open File 2.1',
			command: 'myExtension.openFile2.1',
		  }),
		];
	  }
	  return [];
	}
  }
  
  class MyTreeNode {
	constructor(
	  public readonly label: string,
	  public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	  public readonly command?: vscode.Command,
	) {}
  }