var assetPaths: string[] = [];

export function addAssetPath(path: string) {
    assetPaths.push(path);
}

export function getAssetPaths(): string[] {
    return assetPaths;
}

export function removeAssetPath(path: string) {
    assetPaths = assetPaths.filter(p => p !== path);
}

export function refresh() {
    assetPaths = [];
}