var assetPaths: string[] = [];

export function addAssetPath(path: string) {
    assetPaths.push(path);
}

export function getAssetPaths(): string[] {
    return assetPaths;
}

export function refresh() {
    assetPaths = [];
}