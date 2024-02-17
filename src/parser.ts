import fs = require('fs');

export function getGuid(path: string) {
    var data = fs.readFileSync(path, { encoding: 'utf8' });
    console.log(data);
    let regex = /guid: (.*)/;
    return data.match(regex)?.[1] ?? "";
}

export function getProjectName(data: string) {
    let regex = /productName: (.*)/;
    return data.match(regex)?.[1] ?? "";
}

export function getProjectVersion(data: string) {
    let regex = /m_EditorVersionWithRevision: (.*)/;
    return data.match(regex)?.[1] ?? "";
};

export function getGuids(data: string) {
    let regex = /guid: (.*),/g;
    return data.matchAll(regex) ?? [];
}