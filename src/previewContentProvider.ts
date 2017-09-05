import * as vscode from 'vscode';

export default class previewContentProvider implements vscode.TextDocumentContentProvider {
    static scheme = "vscode-sequence-diagrams";
    private extensionSourceRoot: string;
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private previewUri: vscode.Uri;
    private debounceFileChanged: NodeJS.Timer;

    constructor(extensionSourceRoot: string, previewUri: vscode.Uri) {
        this.extensionSourceRoot = extensionSourceRoot;
        this.previewUri = previewUri;

        // TODO: Clear subscription
        vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor) => {
            // Ignore if changed editor's document isn't the active one
            if (e === undefined || e.document !== vscode.window.activeTextEditor.document)
                return;

            this.updateDocument();
        });

        // TODO: Clear subscription
        vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
            // Ignore if change was made in non-active document
            if (vscode.window.activeTextEditor === undefined || 
                e.document !== vscode.window.activeTextEditor.document) 
                return;

            this.updateDocument();
        });
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    private updateDocument() {
        // Cancel previous timeout
        if (this.debounceFileChanged !== undefined)
        {
            clearTimeout(this.debounceFileChanged);
            this.debounceFileChanged = undefined;    
        }

        // Start new timeout
        this.debounceFileChanged = setTimeout(() => {
            console.log(new Date());
            console.log("Fire!");
            this._onDidChange.fire(this.previewUri);
        }, 450);
    }

    public provideTextDocumentContent(uri: vscode.Uri): string {
        return this.createContent();
    }

    private createContent(): string {
        // Ignore if active document isn't available
        if (vscode.window.activeTextEditor === undefined ||
            vscode.window.activeTextEditor.document === undefined)
            return "";

        // Include scripts
        let includeScripts: string = "";
        this.getScriptIncludes().forEach(includePath => {
            includeScripts += `<script src="${includePath}"></script>`;
        });

        // Generate document
        var content = `
            <style>
                body { margin: 0; background-color: white; color: #333; }
            </style>
            <body>
                <div id="diagram"></div>
                ${includeScripts}
                <script>
                    var diagram = Diagram.parse("${vscode.window.activeTextEditor.document.getText().replace(/[\r?\n]/g, '\\n')}");
                    diagram.drawSVG("diagram", {theme: 'simple'});
                </script>
            </body>`;

        return content;
    }

    private getScriptIncludes(): string[] {
        return [ 
            // TODO: Place scripts here
            this.extensionSourceRoot + "deps/js-sequence-diagrams/snap.svg-min.js",
            this.extensionSourceRoot + "deps/js-sequence-diagrams/underscore-min.js",
            this.extensionSourceRoot + "deps/js-sequence-diagrams/webfont.js",
            this.extensionSourceRoot + "deps/js-sequence-diagrams/sequence-diagram-min.js"
        ];
    }
}