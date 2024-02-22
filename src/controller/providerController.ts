import * as vscode from 'vscode';
import { MetaReferenceProvider } from '../provider/metaReferenceProvider';
import { MetaExplorer } from '../provider/metaExplorer';
import { MainViewProvider } from '../provider/mainViewProvider';

export function initialize(context: vscode.ExtensionContext) {
    const metaExplorer = new MetaExplorer(context);

    const mainViewProvider = new MainViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider('clover.mainView', mainViewProvider);

    const metaReferenceProvider = new MetaReferenceProvider();
    vscode.languages.registerCodeLensProvider('csharp', metaReferenceProvider);
}
