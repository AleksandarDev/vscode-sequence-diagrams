import * as vscode from 'vscode';
import logger from './logger';

export default class previewContentProvider implements vscode.TextDocumentContentProvider {
    static scheme = "vscode-sequence-diagrams";
    private extensionSourceRoot: string;
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private previewUri: vscode.Uri;
    private debounceFileChanged: NodeJS.Timer;
    private previewDocument: vscode.TextDocument;

    constructor(extensionSourceRoot: string, previewUri: vscode.Uri) {
        this.extensionSourceRoot = extensionSourceRoot;
        this.previewUri = previewUri;

        logger.info(this.extensionSourceRoot);
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public refreshDocument(previewDocument: vscode.TextDocument) {
        if (previewDocument === undefined ||
            previewDocument.isClosed)
            return;

        // Assign new preview document
        this.previewDocument = previewDocument;

        // Cancel previous timeout
        if (this.debounceFileChanged !== undefined)
        {
            clearTimeout(this.debounceFileChanged);
            this.debounceFileChanged = undefined;    
        }

        // Start new timeout
        this.debounceFileChanged = setTimeout(() => {
            logger.info("Diagram update requested.");
            
            this._onDidChange.fire(this.previewUri);
        }, 450);
    }

    public provideTextDocumentContent(uri: vscode.Uri): string {
        return this.createContent();
    }

    private createContent(): string {
        // Ignore if active document isn't available
        if (this.previewDocument === undefined)
            return "Not a sequence diagram document.</br>Sequence diagram document needs to have .seqdiag extension.";

        // Include scripts
        let includeScripts: string = "";
        this.getScriptIncludes().forEach(includePath => {
            includeScripts += `<script src="${includePath}"></script>`;
        });

        let svgStyle = `
            body.vscode-dark svg line, svg path {
                stroke: #ababab;
            }

            body.vscode-dark svg .signal line, body.vscode-dark svg .signal path,
            body.vscode-dark svg .title rect, body.vscode-dark svg .title path,
            body.vscode-dark svg .actor rect, body.vscode-dark svg .actor path,
            body.vscode-dark svg .note rect, body.vscode-dark svg .note path {
                fill: none;
                stroke: #ababab;
            }

            body.vscode-dark svg .title text,
            body.vscode-dark svg .signal text,
            body.vscode-dark svg .note text,
            body.vscode-dark svg .actor text {
                fill: #dedede;
            }`;

        // Generate document
        var content = `
            <link href='${this.extensionSourceRoot + "deps/js-sequence-diagrams/sequence-diagram.css"}' rel='stylesheet' />
            <style>
                body { margin: 0; }                
                
                ${svgStyle}

            </style>
            <body>
                <div id="diagram"></div>
                ${includeScripts}
                <script>
                    var diagram = Diagram.parse("${this.previewDocument.getText().replace(/\\/g, '\\\\').replace(/[\r?\n]/g, '\\n')}");
                    diagram.drawSVG("diagram", {theme: 'snapHand'});
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
            this.extensionSourceRoot + "deps/js-sequence-diagrams/sequence-diagram-snap.js"
        ];
    }
}