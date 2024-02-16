// guid:.\w+

export function getGuid(data: string) {
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
}