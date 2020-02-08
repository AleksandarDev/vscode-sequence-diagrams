const exportSvgLink = document.querySelector('.link-download-svg');
const exportPngLink = document.querySelector('.link-download-png');

function getDiagramSvgBase64() {
    var svg = document.getElementById('diagram').children[0];
    var xml = new XMLSerializer().serializeToString(svg);
    return btoa(encodeURIComponent(xml).replace(/%([0-9A-F]{2})/g,(match, p1)=> {
        return String.fromCharCode('0x' + p1);
    }));
}

function disableExportButtons() {
    exportSvgLink.classList.add('disabled');
    exportPngLink.classList.add('disabled');
}

function enableExportButtons() {
    exportSvgLink.classList.remove('disabled');
    exportPngLink.classList.remove('disabled');  
}

try {
    exportSvgLink.onclick = () => {
        if (exportSvgLink.classList.contains('disabled'))
            return;
        disableExportButtons();
        const data = getDiagramSvgBase64();
        if (window.vscode == null)
            window.vscode = acquireVsCodeApi();
        window.vscode.postMessage({
            command: 'export-svg',
            data: data
        });
    };

    exportPngLink.onclick = () => {
        if (exportPngLink.classList.contains('disabled'))
            return;
        disableExportButtons();
        const data = getDiagramSvgBase64();
        if (window.vscode == null)
            window.vscode = acquireVsCodeApi();
        window.vscode.postMessage({
            command: 'export-png',
            data: data
        });
    };

    // Handle the message inside the webview
    window.addEventListener('message', event => { 
        if (event == null ||
            event.data == null ||
            event.data.command == null) {
            return;
        }

        switch(event.data.command) {
            case 'set-source':
                try {
                    document.getElementById("diagram").innerHTML = null;
                    Diagram.parse(event.data.source).drawSVG("diagram", { theme: window.diagramStyle });
                } catch(error) {
                    document.getElementById('diagram').innerHTML = "<code>" + error + "</code>";
                }
                break;
            case 'export-done':
                enableExportButtons();
                break;
        }
    });
}
catch (error) {
    document.getElementById('diagram').innerHTML = "<code>" + error + "</code>";
}
//# sourceMappingURL=contentscript.js.map