# VSCode Sequence Diagrams

_vscode-sequence-diagrams_

## How to

When you open `.seqdiag` file in Visual Studio Code, preview tab will open automatically.

If you wish to reopen the preview tab, press `CTRL+SHIFT+P` or `F1` to open Command Palette and execute `Show Sequence Diagram Preview` command.

See [js-sequence-diagrams](https://bramp.github.io/js-sequence-diagrams/) for syntax details.

## Configuration

| property                         | description                              |
|----------------------------------|------------------------------------------|
| `sequencediagrams.diagram.style` | The diagram style. Select between `hand` for hand drawn diagram or `simple` for diagram with simple straight lines. |
| `sequencediagrams.preview.trigger` | Configure the preview refresh on every change or on file save. Select between `onChange` and `onSave`. |

## Publishing 

### Building the extension package

```bash
yarn install
yarn vscode:prepublish
```

### Publishing to store

Install Visual Studio Code Extensions CLI

```bash
npm install -g vsce
```

Login and publish the extension

```bash
vsce publish -p <token>
```

**Enjoy!**
