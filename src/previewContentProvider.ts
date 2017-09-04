import * as vscode from 'vscode';

export default class previewContentProvider implements vscode.TextDocumentContentProvider {
    static scheme = "vscode-sequence-diagrams";
    private diagramFilePath: string;

    constructor(diagramFilePath: string) {
        this.diagramFilePath = diagramFilePath;
    }

    public provideTextDocumentContent(uri: vscode.Uri): string {
        return this.createContent();
    }

    private createContent(): string {
        // Include scripts
        let includeScripts: string = "";
        this.getScriptIncludes().forEach(includePath => {
            includeScripts += `<script src="${includePath}"></script>`;
        });

        // Generate document
        return `
            <style>
                body { margin: 0; }
                canvas { width: 100%; height: 100% }
            </style>
            <body>
                <div>Hello world!</div>
                ${includeScripts}
            </body>`;
    }

    private getScriptIncludes(): string[] {
        return [ 
            // TODO: Place scripts here
        ];
    }
}