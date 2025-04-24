import * as vscode from 'vscode';
import { MetaReferenceProvider } from '../unityReference/metaReferenceProvider';
import { UnityMessageProvider } from '../unityReference/unityMessageProvider';
import { UnityUsageProvider } from '../unityReference/unityUsageProvider';
import { UnityAssetExplorer } from '../unityAssetExplorer/unityAssetExplorerProvider';
import { MainViewProvider } from '../provider/mainViewProvider';

export function initialize(context: vscode.ExtensionContext) {
    const unityAssetExplorer = new UnityAssetExplorer(context);

    const mainViewProvider = new MainViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider('clover.mainView', mainViewProvider);

    const metaReferenceProvider = new MetaReferenceProvider(context);
    vscode.languages.registerCodeLensProvider('csharp', metaReferenceProvider);

    const unityMessageProvider = new UnityMessageProvider(context);
    vscode.languages.registerCodeLensProvider('csharp', unityMessageProvider);

    const unityUsageProvider = new UnityUsageProvider(context);
    vscode.languages.registerCodeLensProvider('csharp', unityUsageProvider);
}
