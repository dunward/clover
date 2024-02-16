// guid:.\w+

export function getGuid(text: string) {
    let regex = /guid:.\w+/;
    let match = regex.exec(text);
    
    let guid = (match || "").toString();

    return guid.split(':')[1].trim();
}

export function getProjectName(data: string) {
    let regex = /productName: (.*)/;
    return data.match(regex)?.[1] ?? "";
}

export function getProjectVersion(data: string) {
    let regex = /m_EditorVersionWithRevision: (.*)/;
    return data.match(regex)?.[1] ?? "";
}