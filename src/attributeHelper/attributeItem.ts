import * as vscode from 'vscode';

const items: AttributeItem[] = [
    // field
    {
        label: '$(symbol-field) SerializeField',
        attribute: '[SerializeField]'
    },
    {
        label: '$(symbol-field) Header',
        attribute: '[Header("string")]'
    },
    {
        label: '$(symbol-field) HideInInspector',
        attribute: '[HideInInspector]'
    },
    {
        label: '$(symbol-field) Range',
        attribute: '[Range(number, number)]'
    },
    {
        label: '$(symbol-field) Space',
        attribute: '[Space(number)]'
    },
    {
        label: '$(symbol-field) Mutiline',
        attribute: '[Mutiline(number)]',
        description: 'use for string field'
    },
    {
        label: '$(symbol-field) TextArea',
        attribute: '[TextArea(number, number)]',
        description: 'use for string field'
    },
    {
        label: '$(symbol-field) Tooltip',
        attribute: '[Tooltip("string")]'
    },
    // method
    {
        label: '$(symbol-method) MenuItem',
        attribute: '[MenuItem("string")]',
        description: 'use for static method'
    },
    {
        label: '$(symbol-method) ContextMenu',
        attribute: '[ContextMenu("string")]'
    },
    // class
    {
        label: '$(symbol-class) Serializable',
        attribute: '[System.Serializable]'
    },
    {
        label: '$(symbol-class) RequireComponent',
        attribute: '[RequireComponent(typeof(Type))]'
    },
    {
        label: '$(symbol-class) CreateAssetMenu',
        attribute: '[CreateAssetMenu(fileName ="string", menuName ="string")]'
    },
    {
        label: '$(symbol-class) ExecuteInEditMode',
        attribute: '[ExecuteInEditMode]'
    },
];

export function getAttributeItems(): AttributeItem[] {
    return items;
}

interface AttributeItem extends vscode.QuickPickItem {
    attribute: string;
}