import * as vscode from 'vscode';
import * as VSCodeUtils from '../vscodeUtils';

export async function showAttributeHelper() {
    const selected = await vscode.window.showQuickPick(items, { placeHolder: 'Select attribute' });

    if (selected) {
        VSCodeUtils.insertText(selected.attribute);
    }
}

interface AttributeItem extends vscode.QuickPickItem {
    attribute: string;
}

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