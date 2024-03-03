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
    document.getElementById('inspector').innerHTML = '';
    var components = datas.get(id.toString()).data.GameObject.m_Component;
    if (components) {
        components.forEach(component => {
            const html = sampleHtml(component.component.fileID);
            document.getElementById('inspector').innerHTML += html;
        });
    }
}

function sampleHtml(componentId) {
    return `
        <div>
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