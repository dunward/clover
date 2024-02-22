import * as vscode from 'vscode';

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

export function addGuid(path: string, guid: string) {
    mapGuid(vscode.Uri.file(path), guid);
}

export function getGuidByUri(uri: vscode.Uri) {
    var guid = guidByUri.get(uri);
    return guid ?? '';
}

export function addLocation(guid: string, path: string, lineNumber: number) {
    const uri = vscode.Uri.file(path);
    const location = new vscode.Location(uri, new vscode.Position(lineNumber, 0));
    mapLocation(guid, location);
}

export function getLocationsByUri(guid: string) {
    console.log(locationByGuid);
    return locationByGuid.get(guid);
}