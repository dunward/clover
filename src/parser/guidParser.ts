import fs = require('fs');
import * as readline from 'readline';
import * as GuidConnector from './guidConnector';
import * as Logger from '../vscodeUtils';

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
    let stream: fs.ReadStream | null = null;
    let rl: readline.Interface | null = null;
    
    try {
        stream = fs.createReadStream(path, { encoding: 'utf8' });
        rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

        const lines: number[] = [];
        let i = 0;

        for await (const line of rl) {
            const guid = getGuid(line);
            if (guid !== '') {
                GuidConnector.addLocation(guid, path, i);
            }
            i++;
        }

        Logger.outputLog(`Parsed GUID Finished: ${path}`);

        return lines;
    } catch (error) {
        Logger.outputLog(`Error parsing Unity assets at ${path}: ${error}`);
        return [];
    } finally {
        if (rl) {
            rl.close();
        }
        if (stream) {
            stream.destroy();
        }
    }
}