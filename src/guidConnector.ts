import * as vscode from 'vscode';
import path = require('path');

var guidByUri: Map<vscode.Uri, string> = new Map<vscode.Uri, string>();
var locationByGuid: Map<string, vscode.Location[]> = new Map<string, vscode.Location[]>();

function mapGuid(uri: vscode.Uri, guid: string) {
    guidByUri.set(uri, guid);
}

function mapLocation(guid: string, location: vscode.Location) {
    if (locationByGuid.has(guid)) {
        var list = locationByGuid.get(guid);
        list?.push(location);
    } else {
        locationByGuid.set(guid, [location]);
    }
}

export function addGuid(filePath: string, guid: string) {
    var parsePath = path.parse(filePath);
    mapGuid(vscode.Uri.file(path.join(parsePath.dir, parsePath.name)), guid);
}

export function getGuidByUri(uri: vscode.Uri) {
    console.log(uri);
    console.log(guidByUri);
    var guid = guidByUri.get(uri);
    return guid ?? '';
}

export function addLocation(guid: string, path: string, lineNumber: number) {
    const uri = vscode.Uri.file(path);
    const location = new vscode.Location(uri, new vscode.Position(lineNumber, 0));
    mapLocation(guid, location);
}

export function getLocationsByGuid(guid: string) {
    console.log(locationByGuid);
    return locationByGuid.get(guid);
}