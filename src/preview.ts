import * as vscode from 'vscode';
import previewContentProvider from './previewContentProvider';

export default class preview {
    private uri: vscode.Uri;
    private provider: previewContentProvider;

    public present(): Thenable<any> {
        // Retrieve script name and construct preview URI
        this.uri = preview.constructPreviewUri(vscode.window.activeTextEditor.document.uri.toString());        

        // Instantiate preview provider and assign scheme
        this.provider = new previewContentProvider("");
        let registration = vscode.workspace.registerTextDocumentContentProvider(previewContentProvider.scheme, this.provider);

        // Show the preview
        return vscode.commands
            .executeCommand('vscode.previewHtml', this.uri, vscode.ViewColumn.Two)
            .then((success) => {
                // Nice!
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
    }

    static constructPreviewUri(fileName: string): vscode.Uri {
        return vscode.Uri.parse(previewContentProvider.scheme + "://svcode-sequence-diagrams/" + preview.getName(fileName) + " Preview");
    }

    static getName(path: string): string {
        let scriptName = path.split('\\').pop().split('/').pop();
        return scriptName;
    }
}