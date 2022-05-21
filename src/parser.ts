// guid:.\w+

export function getGuid(text: string) {
    let regex = /guid:.\w+/;
    let match = regex.exec(text);
    
    let guid = (match || "").toString();

    return guid.split(':')[1].trim();
}