import fs, { constants } from 'fs';

export enum FsModes {
    EXISTS = constants.F_OK,
    READABLE = constants.R_OK,
    WRITABLE = constants.W_OK
}

export class FsUtils {
    static require(path: string): { data?: any, errors?: Error[] } {
        const result: { data?: any, errors?: Error[] } = {};

        try {
            result.data = require(path);
        } catch (err) {
            result.errors = [err];
        }

        return result;
    }

    static canAccess(path: string, mode?: FsModes): boolean {
        let result = false;

        try {
            fs.accessSync(path, mode);

            result = true;
        } catch (err) {}

        return result;
    }

    static copyFile(filePath: string, destination: string, mode?: FsModes): { errors: Error[] } {
        const errors = [];

        try {
            fs.copyFileSync(filePath, destination, mode);
        } catch (err) {
            errors.push(err);
        }

        return { errors };
    }

    static makeDirectory(path: string, options?: { recursive?: boolean, mode?: FsModes }): { errors: Error[] } {
        const errors = [];

        try {
            fs.mkdirSync(path, options);
        } catch (err) {
            errors.push(err);
        }

        return { errors };
    }

    static readdir(path: string): { data?: any, errors?: Error[] } {
        const result: { data?: any, errors?: Error[] } = {};

        try {
            result.data = fs.readdirSync(path);
        } catch (err) {
            result.errors = [err];
        }

        return result;
    }

    static readFile(path: string): { data?: any, errors?: Error[] } {
        const result: { data?: any, errors?: Error[] } = {};

        try {
            result.data = fs.readFileSync(path);
        } catch (err) {
            result.errors = [err];
        }

        return result;
    }
}
