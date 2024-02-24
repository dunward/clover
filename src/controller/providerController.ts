import * as vscode from 'vscode';
import { MetaReferenceProvider } from '../provider/metaReferenceProvider';
import { UnityAssetExplorer } from '../unityAssetExplorer/metaExplorer';
import { MainViewProvider } from '../provider/mainViewProvider';

export function initialize(context: vscode.ExtensionContext) {
    const metaExplorer = new UnityAssetExplorer(context);

    const mainViewProvider = new MainViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider('clover.mainView', mainViewProvider);

    const metaReferenceProvider = new MetaReferenceProvider();
    vscode.languages.registerCodeLensProvider('csharp', metaReferenceProvider);
}
