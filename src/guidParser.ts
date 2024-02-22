import fs = require('fs');
import * as GuidConnector from './guidConnector';
import * as Logger from './logger';

export function getGuid(data: string) {
    let regex = /guid: (\w+)/;
    let match = data.match(regex);
    return match ? match[1] : '';
}

export async function parseUnityCsGuid(path: string) {
    try {
        const data = await fs.promises.readFile(path, { encoding: 'utf8' });
        const guid = getGuid(data);
        GuidConnector.addGuid(path, guid);
    } catch (error) {
        Logger.outputLog(`Error reading meta file at ${path}: ${error}`);
    }
}

export async function parseUnityAssets(path: string) {
    try {
        const data = await fs.promises.readFile(path, { encoding: 'utf8' });
        const lines: number[] = [];
        const lineData = data.split(/\r?\n/);
        for (let i = 0; i < lineData.length; i++) {
            var guid = getGuid(lineData[i]);
            if (guid != '') {
                GuidConnector.addLocation(guid, path, i);
            }
        }
        return lines;
    } catch (error) {
        Logger.outputLog(`Error reading meta file at ${path}: ${error}`);
    }
}