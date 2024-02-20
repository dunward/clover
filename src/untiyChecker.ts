import fs = require('fs');
import path = require('path');

export function isUnityProject(projectPath: string): boolean {
    var assetPath = path.join(projectPath, 'Assets');
    var projectSettingsPath = path.join(projectPath, 'ProjectSettings');
    
    return fs.existsSync(assetPath) && fs.existsSync(projectSettingsPath);
}