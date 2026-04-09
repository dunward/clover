import * as vscode from 'vscode';
import path = require('path');
import * as Logger from '../vscodeUtils';

var guidByPath: Map<string, string> = new Map<string, string>();
var pathByGuid: Map<string, string> = new Map<string, string>();
var locationByGuid: Map<string, vscode.Location[]> = new Map<string, vscode.Location[]>();

function mapGuid(filePath: string, guid: string) {
    guidByPath.set(filePath, guid);
    pathByGuid.set(guid, filePath);
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
    if (!guid) {
        Logger.outputLog(`[GuidConnector] getGuidByPath: no GUID for ${path.basename(filePath)} (path: ${filePath})`);
    }
    return guid ?? '';
}

export function getPathByGuidMap() {
    return pathByGuid;
}

export function addLocation(guid: string, path: string, lineNumber: number) {
    const uri = vscode.Uri.file(path);
    const location = new vscode.Location(uri, new vscode.Position(lineNumber, 0));
    mapLocation(guid, location);
}

export function getLocationsByGuid(guid: string) {
    const locations = locationByGuid.get(guid);
    Logger.outputLog(`[GuidConnector] getLocationsByGuid: ${guid} -> ${locations?.length ?? 0} locations`);
    return locations;
}

export function removeGuid(filePath: string) {
    const guid = guidByPath.get(filePath);
    if (guid !== undefined) {
        guidByPath.delete(filePath);
        pathByGuid.delete(guid);
    }
}

export function removeLocationsByFile(filePath: string) {
    locationByGuid.forEach((locations, guid) => {
        const filtered = locations.filter(loc => loc.uri.fsPath !== filePath);
        if (filtered.length === 0) {
            locationByGuid.delete(guid);
        } else {
            locationByGuid.set(guid, filtered);
        }
    });
}

export function refresh() {
    guidByPath.clear();
    pathByGuid.clear();
    locationByGuid.clear();
}