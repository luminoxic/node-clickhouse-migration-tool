
export class ConsoleUtils {
    private static get _resetColor() {
        return "\x1b[0m";
    }

    static logWithPrefix(prefix: string, text: string): void {
        console.log("\x1b[32m" + prefix + ConsoleUtils._resetColor + text);
    }

    static infoWithPrefix(prefix: string, text: string): void {
        console.log("\x1b[33m" + prefix + ConsoleUtils._resetColor + text);
    }

    static log(text: string | Error): void {
        console.log("\x1b[32m" + text + ConsoleUtils._resetColor);
    }

    static warn(text: string | Error): void {
        console.warn("\x1b[33m" + text + ConsoleUtils._resetColor);
    }

    static error(text: string | Error): void {
        console.error("\x1b[31m" + text + ConsoleUtils._resetColor);
    }
}
