import * as vscode from 'vscode';
import { initialize as loaderInit } from './loader';
import { initialize as commandInit } from './vscode/command';


export function initialize(context: vscode.ExtensionContext) {
    // file loader initialize
    loaderInit();

    // command register initialize
    commandInit(context);
}