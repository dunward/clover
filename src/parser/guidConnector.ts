import * as vscode from 'vscode';
import path = require('path');

var guidByPath: Map<string, string> = new Map<string, string>();
var locationByGuid: Map<string, vscode.Location[]> = new Map<string, vscode.Location[]>();

function mapGuid(filePath: string, guid: string) {
    guidByPath.set(filePath, guid);
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
    mapGuid(path.join(parsePath.dir, parsePath.name), guid);
}

export function getGuidByPath(filePath: string) {
    var guid = guidByPath.get(filePath);
    return guid ?? '';
}

export function addLocation(guid: string, path: string, lineNumber: number) {
    const uri = vscode.Uri.file(path);
    const location = new vscode.Location(uri, new vscode.Position(lineNumber, 0));
    mapLocation(guid, location);
}

export function getLocationsByGuid(guid: string) {
    return locationByGuid.get(guid);
}