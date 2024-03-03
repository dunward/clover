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
            console.log(datas.get(component.component.fileID).data);
            inspector.innerHTML += sampleHtml(component.component.fileID);
        });
    }
}

function gameObjectBaseHtml(gameObject) {
    return `
        <div class="inspector-object">
            <div class="inspector-gameObject-base-left">
                <span class="icon">&#xe901;</span>
            </div>
            <div class="inspector-gameObject-base-right">
                <div>
                    <span class="icon">${getCheckBoxIcon(gameObject.m_IsActive)}</span>${gameObject.m_Name}
                </div>
                <div class="flex-width">
                    <div><span class="icon">&#xe935</span> Tag ${gameObject.m_TagString}</div>
                    <div><span class="icon">&#xe92e</span> Layer ${gameObject.m_Layer}</div>
                </div>
            </div>
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

function sampleHtml(componentId) {
    return `
        <div class="inspector-object">
            ${componentId}
        </div>
    `;
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