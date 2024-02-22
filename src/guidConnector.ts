import * as vscode from 'vscode';

var pathByGuid: Map<string, string> = new Map<string, string>();
var locationByUri: Map<vscode.Uri, vscode.Location[]> = new Map<vscode.Uri, vscode.Location[]>();

function mapPath(guid: string, path: string) {
    pathByGuid.set(guid, path);
}

function mapLocation(uri: vscode.Uri, location: vscode.Location) {
    if (locationByUri.has(uri)) {
        var list = locationByUri.get(uri);
        list?.push(location);
    } else {
        locationByUri.set(uri, [location]);
    }
}

export function getLocations(uri: vscode.Uri) {
    return locationByUri.get(uri);
}

export function addLocation(path: string, lineNumber: number) {
    const uri = vscode.Uri.file(path);
    const location = new vscode.Location(uri, new vscode.Position(lineNumber, 0));
    mapLocation(uri, location);
}