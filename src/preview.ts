import * as vscode from 'vscode';
import previewContentProvider from './previewContentProvider';
import logger from './logger';

export default class preview {
    private provider: previewContentProvider;
    private extensionSourceRoot: string;
    private exContext: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, extensionSourceRoot: string) {
        this.exContext = context;
        this.extensionSourceRoot = extensionSourceRoot;

        this.checkRefreshDocument = this.checkRefreshDocument.bind(this)

        // Attach to events
        var disposeOnDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(this.checkRefreshDocument);
        var disposeOnDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(this.checkRefreshDocument);

        this.exContext.subscriptions.push(disposeOnDidChangeTextDocument);
        this.exContext.subscriptions.push(disposeOnDidChangeActiveTextEditor);
    }

    public async present() {
        // Instantiate preview provider and assign scheme
        this.provider = new previewContentProvider(this.exContext, this.extensionSourceRoot);
        this.provider.diagramStyle = vscode.workspace.getConfiguration("sequencediagrams").get("diagram.style", "simple");
        this.provider.present();

        this.checkRefreshDocument(vscode.window.activeTextEditor);
    }

    private checkRefreshDocument(editor: vscode.TextEditor | vscode.TextDocumentChangeEvent) {
        // Ignore if changed editor's document isn't the active one
        // or document is not diagram document
        if (editor === undefined || 
            vscode.window.activeTextEditor === undefined || 
            editor.document == null ||
            editor.document.isClosed ||
            editor.document !== vscode.window.activeTextEditor.document ||
            !preview.isDocumentDiagram(editor.document)) {

            logger.info("Check refresh document rejected.");
            return;
        }

        logger.info("Check refresh document accepted.");

        this.provider.refreshDocument(editor.document);
    }

    private static isDocumentDiagram(doc: vscode.TextDocument) {
        return doc.languageId === "sequencediagram";
    }
}