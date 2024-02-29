function updateHierarchy(transforms) {
    const hierarchy = document.getElementById('hierarchy');
    transforms.forEach(transform => {
        let fatherId;
        let gameObjectId;
        if (transform.classId == "4")
        {
            gameObjectId = transform.fileId;
            fatherId = transform.data.Transform.m_Father?.fileID ?? -1;
        }
        else
        {
            console.log(transform.data.RectTransform);
            gameObjectId = transform.fileId;
            fatherId = transform.data.RectTransform.m_Father?.fileID ?? -1;
        }

        console.log("I'm " + gameObjectId + "my father is " + fatherId);

        if (fatherId == -1 || gameObjectId == -1) return;
        if (fatherId == 0) return;

        const gameObjectElement = document.getElementById(gameObjectId);
        console.log(gameObjectElement);
        
        if (gameObjectElement) {
            const fatherElement = document.getElementById(fatherId + "-children");
            if (fatherElement) {
                fatherElement.appendChild(gameObjectElement);
            } else {
                hierarchy.appendChild(gameObjectElement);
            }
        }
    });
}