function initialize()
{
    document.querySelectorAll('.hierarchy-object').forEach(element => {
        element.addEventListener('click', function() {
            console.log('Hierarchy object clicked:', this.id);
        });
    });
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
        console.log(myElement);
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