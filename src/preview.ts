import * as vscode from 'vscode';
import previewContentProvider from './previewContentProvider';
import logger from './logger';

export default class preview {
    private uri: vscode.Uri;
    private provider: previewContentProvider;
    private extensionSourceRoot: string;

    constructor(extensionSourceRoot: string) {
        this.extensionSourceRoot = extensionSourceRoot;
        
        // TODO: Clear subscription
        vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
            // Ignore if change was made in non-active document
            if (e === undefined || 
                vscode.window.activeTextEditor === undefined || 
                e.document !== vscode.window.activeTextEditor.document) 
                return;

                // Ignore if document is not diagram document
            if (!preview.isDocumentDiagram(e.document)) 
                return;

            this.provider.refreshDocument(e.document);
        });

        // TODO: Clear subscription
        vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor) => {
            // Ignore if changed editor's document isn't the active one
            if (e === undefined || 
                vscode.window.activeTextEditor === undefined || 
                e.document !== vscode.window.activeTextEditor.document)
                return;

            // Ignore if document is not diagram document
            if (!preview.isDocumentDiagram(e.document)) 
                return;

            this.provider.refreshDocument(e.document);
        });
    }

    private static isDocumentDiagram(doc: vscode.TextDocument) {
        return doc.languageId === "sequencediagram";
    }

    public present(): Thenable<any> {
        logger.info("Present requested.");

        // Retrieve script name and construct preview URI
        this.uri = preview.constructPreviewUri();        

        // Instantiate preview provider and assign scheme
        this.provider = new previewContentProvider(this.extensionSourceRoot, this.uri);

        // TODO: Dispose registration
        let registration = vscode.workspace.registerTextDocumentContentProvider(previewContentProvider.scheme, this.provider);

        // Show the preview
        return vscode.commands
            .executeCommand('vscode.previewHtml', this.uri, vscode.ViewColumn.Two)
            .then((success) => {
                // Refresh active document (if available)
                if (vscode.window.activeTextEditor !== undefined &&
                    vscode.window.activeTextEditor.document !== undefined &&
                    preview.isDocumentDiagram(vscode.window.activeTextEditor.document))
                    this.provider.refreshDocument(vscode.window.activeTextEditor.document);
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
    }

    static constructPreviewUri(): vscode.Uri {
        return vscode.Uri.parse(previewContentProvider.scheme + "://vscode-sequence-diagrams/Sequence Diagram Preview");
    }

    static getName(path: string): string {
        let scriptName = path.split('\\').pop().split('/').pop();
        return scriptName;
    }
}