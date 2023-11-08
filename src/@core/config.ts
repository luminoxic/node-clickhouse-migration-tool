import { program } from "commander";
import path from 'path';
import { FsModes, FsUtils } from "./utils/fs";
import { SystemUtils } from "./utils/system";

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

export class Config {
    /** Private declarations */
    private static _data: TConfig | null = null;
    
    private static _validateConfig() {
        if (Config._data === null || typeof Config._data !== 'object') {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: "Invalid config format. Please run 'clickhouse-migrate init' to create the file."
                }
            });
        }

        if (
            typeof Config._data.connection.host !== 'string' ||
            typeof Config._data.connection.username !== 'string' ||
            typeof Config._data.connection.database !== 'string' ||
            typeof Config._data.connection.password !== 'string'
        ) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: "Missing required connection fields(host, username, database, password). Please run 'clickhouse-migrate init' to create the file."
                }
            });
        }
    }

    private static _prepareConfig() {
        const { connection, options } = Config._data;
        const preparedConfig = {
            connection: {
                host: connection.host,
                username: connection.username,
                password: connection.password,
                database: connection.database
            },
            options: {
                migrations: {
                    tableName: options?.migrations?.tableName || 'migrations',
                    path: options?.migrations?.path || 'migrations/'
                },
                database: {
                    createIfNotExists: options?.database?.createIfNotExists || true,
                    engine: options?.database?.engine || 'Atomic'
                }
            }
        }

        Config._data = preparedConfig;
    }

    private static _loadConfig() {
        const isConfigExists = Config.isConfigExists();
        if (!isConfigExists) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: `The "${CONFIG_FILE_NAME}" file does not exist. Please run 'clickhouse-migrate init' to create the file.`
                }
            });
        }

        const loadingConfigResult = FsUtils.require(Config.path);
        if (Array.isArray(loadingConfigResult.errors) && loadingConfigResult.errors.length > 0) {
            return SystemUtils.exit({ code: 0, log: { type: 'error', message: loadingConfigResult.errors } });
        }

        Config._data = loadingConfigResult.data;
        
        Config._validateConfig();
        Config._prepareConfig();
    }

    /** Public declarations */
    /** Getters */
    static get data() {
        if (!Config._data) {
            Config._loadConfig();
        }

        return Config._data;
    }

    static get path() {
        const { config } = program.opts();

        return path.resolve(process.cwd(), config || CONFIG_FILE_NAME);
    }

    static get migrationsDirPath() {
        const { options } = Config.data;
    
        return path.resolve(process.cwd(), options.migrations.path);
    }

    /** Methods */
    public static isConfigExists(): boolean {
        const result = FsUtils.canAccess(Config.path, FsModes.READABLE);

        return result;
    }
}
