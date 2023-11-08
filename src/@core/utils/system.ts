import { ConsoleUtils } from "./console";

export class SystemUtils {
    private static _getMessage(data: string | string[] | Error | Error[]) {
        return Array.isArray(data) ? data[0] : data;
    }

    static exit(data: { code: number; log: { type: 'error' | 'warn' | 'log', message: string | string[] | Error | Error[] } }) {
        const message = SystemUtils._getMessage(data.log.message);

        ConsoleUtils[data.log.type](message);
        process.exit(data.code);
    }
}
