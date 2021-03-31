import * as vscode from 'vscode';
import * as svg2png from 'svg2png';
import * as utils from './utils';
import logger from './logger';
import { writeFileSync } from 'fs';
import * as path from 'path';

export default class previewContentProvider {
    public diagramStyle: string;
    private currentPanel: vscode.WebviewPanel;
    private previewDocument: vscode.TextDocument;
    private throttledRefreshDocument;
    private extensionPath: string;

    constructor(context: vscode.ExtensionContext) {
        this.extensionPath = context.extensionPath;

        this._receiveMessage = this._receiveMessage.bind(this);
        this._refreshDocument = this._refreshDocument.bind(this);
        this._getExportFileName = this._getExportFileName.bind(this);

        this.currentPanel = vscode.window.createWebviewPanel(
            'sequence-diagram',
            'Sequence Diagram',
            vscode.ViewColumn.Two, {
                enableScripts: true,
                enableCommandUris: false,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'dist')
                ]
            });

        // Handle messages from the webview
        this.currentPanel.webview.onDidReceiveMessage(
            this._receiveMessage,
            undefined,
            context.subscriptions);

        this.currentPanel.onDidDispose(
            () => { this.currentPanel = undefined; },
            undefined,
            context.subscriptions);

        this.throttledRefreshDocument = utils.throttle(this._refreshDocument, 200);
    }

    private async _receiveMessage(message) {
        if (message == null || message.command == null) return;

        let extension;
        try {
            let exportFileName;
            switch (message.command) {
                case 'export-svg':
                    extension = "svg";
                    exportFileName = this._getExportFileName(extension);
                    writeFileSync(exportFileName, Buffer.from(message.data, 'base64').toString('binary'));
                    break;
                case 'export-png':
                    extension = "png";
                    exportFileName = this._getExportFileName(extension);
                    const pngBuffer = await svg2png(Buffer.from(message.data, 'base64'));
                    writeFileSync(exportFileName, pngBuffer);
                    break;
            }
            vscode.window.showInformationMessage("Sequence Diagrams - " + extension.toUpperCase() + " saved to " + exportFileName);
        } catch(error) {
            logger.error(error);
            vscode.window.showErrorMessage("Sequence Diagrams - Failed to save " + extension.toUpperCase());
        }

        this.currentPanel.webview.postMessage({
            command: 'export-done',
        });
    }

    private _getExportFileName(extension: string) : string {
        const fileName = this.previewDocument.fileName;
        const exportFileName = (fileName.substr(0, fileName.lastIndexOf('.')) || fileName) + "." + extension;
        return exportFileName;
    }

    public present() {
        this.setWebViewContent();
    }

    public refreshDocument(previewDocument: vscode.TextDocument) {
        this.previewDocument = previewDocument;
        this.throttledRefreshDocument();
    }

    private _refreshDocument() {
        this.currentPanel.webview.postMessage({
            command: 'set-source',
            source: this.previewDocument.getText()
        });
    }

    private setWebViewContent() {
        if (this.currentPanel == null) return;
        this.currentPanel.webview.html = this.createContent()
    }

    private createContent(): string {
        const svgStyle = `
            body { margin: 0; }

            .status-panel {
                background-color: rgba(128, 128, 128, 0.1);
                padding: 4px;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: right;
            }

            .export-btn {
                cursor: pointer;
                border: 1px solid #aaa;
                padding: 4px 8px;
                color: #333333;
                display: inline-block;
            }
            body.vscode-dark .export-btn {
                color: #dedede;
            }

            .export-btn.disabled {
                cursor: default;
                background-color: rgba(128, 128, 128, 0.1);
                color: #666666;
            }
            body.vscode-dark .export-btn.disabled {
                color: #aaaaaa;
            }

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

        return `
            <html>
                <link href='${this.assetPath("deps/js-sequence-diagrams/sequence-diagram.css")}' rel='stylesheet' />
                <style>${svgStyle}</style>
                <body>
                    <div id="diagram"></div>
                    <div class='status-panel'>
                        <div class='export-btn link-download-svg'>Export SVG</div>
                        <div class='export-btn link-download-png'>Export PNG</div>
                    </div>
                    <script>
                        window.diagramStyle = "${this.diagramStyle}";
                    </script>
                    <script src="${this.assetPath("deps/js-sequence-diagrams/snap.svg-min.js")}"></script>
                    <script src="${this.assetPath("deps/js-sequence-diagrams/underscore-min.js")}"></script>
                    <script src="${this.assetPath("deps/js-sequence-diagrams/webfont.js")}"></script>
                    <script src="${this.assetPath("deps/js-sequence-diagrams/sequence-diagram-snap-min.js")}"></script>
                    <script src="${this.assetPath("contentscript.js")}"></script>
                </body>
            </html>`;
    }

    private assetPath(resourcePath) {
        return this.currentPanel.webview.asWebviewUri(
            vscode.Uri.file(
                path.join(this.extensionPath, 'dist', resourcePath)
            )
        )
    }
}