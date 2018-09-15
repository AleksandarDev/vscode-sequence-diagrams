'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import preview from './preview';
import logger from './logger';

var previewInstance: preview;

export function activate(context: vscode.ExtensionContext) {
    logger.info("Active!")

    // Retrieve the extension's absolute path
    let absolutePath = "vscode-resource:" + context.asAbsolutePath("out/src/");
    logger.info("Extension root: " + absolutePath);

    // Open the preview
    previewInstance = new preview(context, absolutePath);
    previewInstance.present();

    // Register commands
    const disposableCommands = [
        vscode.commands.registerCommand('extension.showsequencediagrampreview', () => { previewInstance.present(); }),
    ];

    for (let disposableCommandIndex = 0; disposableCommandIndex < disposableCommands.length; disposableCommandIndex++) {
        context.subscriptions.push(disposableCommands[disposableCommandIndex]);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}