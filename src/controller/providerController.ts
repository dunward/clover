import * as vscode from 'vscode';
import { MetaReferenceProvider } from '../metaReference/metaReferenceProvider';
import { UnityAssetExplorer } from '../unityAssetExplorer/unityAssetExplorerProvider';
import { MainViewProvider } from '../provider/mainViewProvider';

export function initialize(context: vscode.ExtensionContext) {
    const unityAssetExplorer = new UnityAssetExplorer(context);

    const mainViewProvider = new MainViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider('clover.mainView', mainViewProvider);

    const metaReferenceProvider = new MetaReferenceProvider(context);
    vscode.languages.registerCodeLensProvider('csharp', metaReferenceProvider);
}
