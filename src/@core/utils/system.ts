import path from 'path';
import url from 'url';

import Console from "./console.js";

export default class System {
    private static _getMessage(data: string | string[] | Error | Error[]) {
        return Array.isArray(data) ? data[0] : data;
    }

    static dirname(metaUrl) {
        const filename = url.fileURLToPath(metaUrl);
        const dirname = path.dirname(filename);

        return dirname;
    }

    static exit(data: { code: number; log: { type: 'error' | 'warn' | 'log', message: string | string[] | Error | Error[] } }) {
        const message = System._getMessage(data.log.message);

        Console[data.log.type](message);
        process.exit(data.code);
    }
}
