import * as UnityYamlParser from 'unity-yaml-parser';

var datas: Map<string, UnityYamlParser.UnityYamlData> = new Map();
var transforms: UnityYamlParser.UnityYamlData[] = [];

export function getHierarchyHtmlTreeBase(fileId: string, name: string) {
    return `
        <li id="${fileId}">
            <div class="hierarchy-object"><span class="icon">&#xe901;</span>${name}</div>
            <ul id="${fileId}-children">
            </ul>
        </li>
    `;
}

export function initialize(path: string) {
    datas.clear();
    transforms = [];
    datas = UnityYamlParser.parse(path);
    datas.forEach((data) => {
        if ((data.classId == "4" || data.classId == "224") && !data.stripped) {
            transforms.push(data);
        }
    });
}

export function getTransforms() {
    return transforms;
}

export function getTransformObjectName(transform: UnityYamlParser.UnityYamlData) {
    switch (transform.classId) {
        case "4":
            return datas.get(transform.data.Transform.m_GameObject?.fileID.toString())?.data.GameObject.m_Name;
        case "224":
            return datas.get(transform.data.RectTransform.m_GameObject?.fileID.toString())?.data.GameObject.m_Name;
    }
}