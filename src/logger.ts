export default class logger {
    static loggerPrefix: string = "vscode-sequence-diagrams: ";

    public static info(message?: any) {
        if (typeof message === 'string')
            console.log(logger.loggerPrefix + message);
        else console.log(logger.loggerPrefix, message);
    }

    public static warn(message?: any) {
        console.warn(logger.loggerPrefix + message);
    }

    public static error(message?: any) {
        console.error(logger.loggerPrefix + message);
    }
}