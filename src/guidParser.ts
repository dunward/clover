import fs = require('fs');
import * as GuidConnector from './guidConnector';
import * as Logger from './logger';

export function getGuid(data: string) {
    let regex = /guid: (.*),/;
    let match = data.match(regex);
    return match ? match[1] : '';
}

export async function parseUnityAssets(path: string) {
    try {
        const data = await fs.promises.readFile(path, { encoding: 'utf8' });
        var lines: number[] = [];
        const lineData = data.split(/\r?\n/);
        for (let i = 0; i < lineData.length; i++) {
            var guid = getGuid(lineData[i]);
            if (lineData[i].includes(guid)) {
                GuidConnector.addLocation(path, i);
            }
        }
        return lines;
    } catch (error) {
        Logger.outputLog(`Error reading meta file at ${path}: ${error}`);
    }
}