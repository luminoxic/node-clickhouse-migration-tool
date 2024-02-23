import { program } from "commander";
import path from 'path';

import Fs, { FsModes } from "./utils/fs.js";
import System from "./utils/system.js";

export type TConfig = {
    connection: {
        host: string;
        username: string;
        database: string;
        password: string;
    },
    options: {
        migrations: {
            tableName: string,
            path: string
        },
        database: {
            createIfNotExists: boolean,
            engine: 'Atomic' | 'MySQL' | 'MaterializedMySQL' | 'Lazy' | 'PostgreSQL' | 'MaterializedPostgreSQL' | 'Replicated' | 'SQLite'
        }
    }
}

export const CONFIG_FILE_NAME = 'clickhouse.config.js';

export default class Config {
    /** Private declarations */
    private static data: TConfig | null = null;

    private static async isConnectionDataValid() {
        const config = await Config.get();

        return (
            typeof config?.connection?.host === 'string' &&
            typeof config?.connection?.username === 'string' &&
            typeof config?.connection?.database === 'string' &&
            typeof config?.connection?.password === 'string'
        );
    }

    private static async isOptionsDataValid() {
        const config = await Config.get();

        return (
            typeof config?.options?.migrations?.tableName === 'string' &&
            typeof config?.options?.migrations?.path === 'string' &&
            typeof config?.options?.database?.createIfNotExists === 'boolean' &&
            typeof config?.options?.database?.engine === 'string'
        );
    }

    private static prepareConfig(data: TConfig) {
        const { connection, options } = data;

        const preparedConfig = {
            connection: {
                host: connection?.host,
                username: connection?.username,
                password: connection?.password,
                database: connection?.database
            },
            options: {
                migrations: {
                    tableName: options?.migrations?.tableName || 'migrations',
                    path: path.resolve(process.cwd(), (options?.migrations?.path || 'migrations/'))
                },
                database: {
                    createIfNotExists: options?.database?.createIfNotExists || true,
                    engine: options?.database?.engine || 'Atomic'
                }
            }
        }

        Config.data = preparedConfig;
    }

    private static async load() {
        const isConfigExists = Config.isConfigExists();
        if (!isConfigExists) {
            return System.exit({
                code: 0,
                log: { type: 'error', message: `The "${CONFIG_FILE_NAME}" file does not exist. Please run 'clickhouse-migrate init' to create the file.`}
            });
        }

        const loadingConfigResult = await Fs.import(Config.path);
        if (Array.isArray(loadingConfigResult.errors) && loadingConfigResult.errors.length > 0) {
            return System.exit({
                code: 0,
                log: { type: 'error', message: loadingConfigResult.errors }
            });
        }

        if (
            typeof loadingConfigResult.data !== 'object' ||
            loadingConfigResult.data === null ||
            typeof loadingConfigResult.data.default !== 'object' ||
            loadingConfigResult.data.default === null
        ) {
            return System.exit({
                code: 0,
                log: { type: 'error', message: "Invalid config format. Please run 'clickhouse-migrate init' to create the file." }
            });
        }

        Config.prepareConfig(loadingConfigResult.data?.default);
    }

    private static async get() {
        if (!Config.data) {
            await Config.load();
        }

        return Config.data;
    }

    /** Public declarations */
    /** Getters */
    static get path() {
        const { config } = program.opts();

        return path.resolve(process.cwd(), config || CONFIG_FILE_NAME);
    }

    /** Methods */
    public static async connection(): Promise<TConfig['connection'] | void> {
        const connectionDataValid = await Config.isConnectionDataValid();
        if (!connectionDataValid) {
            return System.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: "Missing required connection fields(host, username, database, password). Please run 'clickhouse-migrate init' to create the file or check config structure."
                }
            });
        }

        const { connection } = await Config.get();

        return connection;
    }

    public static async options(): Promise<TConfig['options'] | void> {
        const optionsDataValid = await Config.isOptionsDataValid();
        if (!optionsDataValid) {
            return System.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: "Missing required options fields(migrations: <tableName, path>, database: <createIfNotExists, engine>). Please run 'clickhouse-migrate init' to create the file or check config structure."
                }
            });
        }

        const { options } = await Config.get();

        return options;
    }

    public static isConfigExists(): boolean {
        const result = Fs.canAccess(Config.path, FsModes.READABLE);

        return result;
    }
}
