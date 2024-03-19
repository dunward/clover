var datas;
var pathByGuid;

function initialize(_datas, _pathByGuid)
{
    datas = new Map();
    pathByGuid = new Map();
    Object.entries(_pathByGuid).forEach(([key, value]) => {
        pathByGuid.set(key, value);
    });

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

function isBuiltInMonoBehaviour(guid) {
    switch (guid) {
        case "30649d3a9faa99c48a7b1166b86bf2a0":
            return true;
        default:
            return false;
    }
}

function getBuiltInMonoBehaviourName(guid) {
    switch (guid) {
        case "30649d3a9faa99c48a7b1166b86bf2a0":
            return "Horizontal Layout Group";
    }
}