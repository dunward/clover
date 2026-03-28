import * as vscode from 'vscode';
import { MetaReferenceProvider } from '../unityReference/metaReferenceProvider';
import { UnityMessageProvider } from '../unityReference/unityMessageProvider';
import { UnityUsageProvider } from '../unityReference/unityUsageProvider';
import { UnityAssetExplorer } from '../unityAssetExplorer/unityAssetExplorerProvider';
import { MainViewProvider } from '../provider/mainViewProvider';

let metaReferenceProvider: MetaReferenceProvider;
let unityMessageProvider: UnityMessageProvider;
let unityUsageProvider: UnityUsageProvider;

export function initialize(context: vscode.ExtensionContext) {
    const unityAssetExplorer = new UnityAssetExplorer(context);

    const mainViewProvider = new MainViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider('clover.mainView', mainViewProvider);

    metaReferenceProvider = new MetaReferenceProvider(context);
    vscode.languages.registerCodeLensProvider('csharp', metaReferenceProvider);

    unityMessageProvider = new UnityMessageProvider(context);
    vscode.languages.registerCodeLensProvider('csharp', unityMessageProvider);

    unityUsageProvider = new UnityUsageProvider(context);
    vscode.languages.registerCodeLensProvider('csharp', unityUsageProvider);
}

export function fireCodeLensRefresh() {
    metaReferenceProvider?.fireChange();
    unityMessageProvider?.fireChange();
    unityUsageProvider?.fireChange();
}
