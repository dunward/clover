export function getHierarchyHtmlTreeBase(fileId: string, name: string) {
    return `
        <li id="${fileId}">
            <div class="hierarchy-object"><span class="icon">&#xe900;</span>${name}</div>
            <ul id="${fileId}-children">
            </ul>
        </li>
    `;
}