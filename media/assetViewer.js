var datas;

function initialize(_datas)
{
    datas = new Map();

    Object.entries(_datas).forEach(([key, value]) => {
        datas.set(key, value);
    });

    document.querySelectorAll('.hierarchy-object').forEach(element => {
        element.addEventListener('click', function() {
            updateInspector(this.id);
        });
    });
}

function updateInspector(id) {
    var inspector = document.getElementById('inspector');
    var gameObject = datas.get(id.toString()).data.GameObject;
    var components = gameObject.m_Component;

    inspector.innerHTML = '';
    inspector.innerHTML += gameObjectBaseHtml(gameObject);
    if (components) {
        components.forEach(component => {
            inspector.innerHTML += getComponentHtml(datas.get(component.component.fileID));
        });
    }
}

function gameObjectBaseHtml(gameObject) {
    return `
        <div class="inspector-game-object">
            <div class="inspector-gameObject-base-left">
                <span class="icon">&#xe901;</span>
            </div>
            <div class="inspector-gameObject-base-right">
                <div>
                    <span class="icon">${getCheckBoxIcon(gameObject.m_IsActive)}</span>${gameObject.m_Name}
                </div>
                <div class="flex-width">
                    <div><span class="icon">&#xe935</span><b>Tag&nbsp;</b>${gameObject.m_TagString}</div>
                    <div><span class="icon">&#xe92e</span><b>Layer&nbsp;</b>${gameObject.m_Layer}</div>
                </div>
            </div>
        </div>
    `;
}

function getComponentHtml(component) {
    switch (component.classId) {
        case "4":
            return getTransformHtml(component.data.Transform);
        case "20":
            return getCameraHtml(component.data.Camera);
        case "114":
            return getMonoBehaviourHtml(component.data.MonoBehaviour);
        case "224":
            return getRectTransformHtml(component.data.RectTransform);
        default:
            return getUnknownComponentHtml(component);
    }
}

function getTransformHtml(component) {
    return `
        <div class="inspector-object">
            <div><span class="icon">&#xe947</span><b>Transform</b></div>
            <div class="property">
                <div class="name">Position</div>
                <div class="content">
                    <div class="label">X</div><div class="value">${component.m_LocalPosition.x}</div>
                    <div class="label">Y</div><div class="value">${component.m_LocalPosition.y}</div>
                    <div class="label">Z</div><div class="value">${component.m_LocalPosition.z}</div>
                </div>
            </div>
            <div class="property">
                <div class="name">Rotation</div>
                <div class="content">
                    <div class="label">X</div><div class="value">${component.m_LocalRotation.x}</div>
                    <div class="label">Y</div><div class="value">${component.m_LocalRotation.y}</div>
                    <div class="label">Z</div><div class="value">${component.m_LocalRotation.z}</div>
                </div>
            </div>
            <div class="property">
                <div class="name">Scale</div>
                <div class="content">
                    <div class="label">X</div><div class="value">${component.m_LocalScale.x}</div>
                    <div class="label">Y</div><div class="value">${component.m_LocalScale.y}</div>
                    <div class="label">Z</div><div class="value">${component.m_LocalScale.z}</div>
                </div>
            </div>
        </div>
    `;
}

function getCameraHtml(component) {
    return `
        <div class="inspector-object">
            <div><span class="icon">&#xe914</span><b>Camera</b></div>
            <div class="property">
            <div class="name">Clear Flags</div>
            <div class="content">
                ${component.m_ClearFlags}
            </div>
        </div>
        </div>
    `;
}

function getMonoBehaviourHtml(component) {
    return `
        <div class="inspector-object">
            <div><span class="icon">&#xea80</span><b>MonoBehaviour</b></div>
        </div>
    `;
}

function getRectTransformHtml(component) {
    return `
        <div class="inspector-object">
            <div><span class="icon">&#xe947</span><b>Rect Transform</b></div>
            <div class="property">
                <div class="name">Position</div>
                <div class="content">
                    <div class="label">X</div><div class="value">${component.m_LocalPosition.x}</div>
                    <div class="label">Y</div><div class="value">${component.m_LocalPosition.y}</div>
                    <div class="label">Z</div><div class="value">${component.m_LocalPosition.z}</div>
                </div>
            </div>
            <div class="property">
                <div class="name">Rotation</div>
                <div class="content">
                    <div class="label">X</div><div class="value">${component.m_LocalRotation.x}</div>
                    <div class="label">Y</div><div class="value">${component.m_LocalRotation.y}</div>
                    <div class="label">Z</div><div class="value">${component.m_LocalRotation.z}</div>
                </div>
            </div>
            <div class="property">
                <div class="name">Scale</div>
                <div class="content">
                    <div class="label">X</div><div class="value">${component.m_LocalScale.x}</div>
                    <div class="label">Y</div><div class="value">${component.m_LocalScale.y}</div>
                    <div class="label">Z</div><div class="value">${component.m_LocalScale.z}</div>
                </div>
            </div>
        </div>
    `;
}

function getUnknownComponentHtml(component) {
    return `
        <div class="inspector-object">
            <div>Unsupported component type : ${component.classId}</div>
            <div><a href="https://github.com/novemberi/clover" target="_blank">Request to add this type</a></div>
        </div>
    `;
}

function getCheckBoxIcon(isActive) {
    if (isActive == 1) {
        return '&#xea52;';
    } else {
        return '&#xea53;';
    }
}

function updateHierarchy(transforms) {
    const hierarchy = document.getElementById('hierarchy');
    transforms.forEach(transform => {
        let myId;
        let children;
        if (transform.classId == "4")
        {
            myId = transform.fileId;
            children = transform.data.Transform.m_Children;
        }
        else
        {
            myId = transform.fileId;
            children = transform.data.RectTransform.m_Children;
        }

        const myElement = document.getElementById(myId + "-children");
        if (children)
        {
            children.forEach(child => {
                const childId = child.fileID;
                const childElement = document.getElementById(childId);
                if (childElement) {
                    myElement.appendChild(childElement);
                }
            });
        }
    });
}