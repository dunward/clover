import * as UnityYamlParser from 'unity-yaml-parser';

var datas: Map<string, UnityYamlParser.UnityYamlData>;
const transforms: UnityYamlParser.UnityYamlData[] = [];

export function getHierarchyHtmlTreeBase(fileId: string, name: string) {
    return `
        <li id="${fileId}">
            <div class="hierarchy-object"><span class="icon">&#xe900;</span>${name}</div>
            <ul id="${fileId}-children">
            </ul>
        </li>
    `;
}

export function initialize(path: string) {
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
    if (transform.classId == "4")
        return datas.get(transform.data.Transform.m_GameObject?.fileID.toString())?.data.GameObject.m_Name;
    else if (transform.classId == "224")
        return datas.get(transform.data.RectTransform.m_GameObject?.fileID.toString())?.data.GameObject.m_Name;
}