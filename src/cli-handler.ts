import { constants } from 'fs/promises';
import path from 'path';

import Clickhouse from './@core/clickhouse/index.js';

import Config, { CONFIG_FILE_NAME } from './@core/config.js';

import Console from './@core/utils/console.js';
import Crypto from './@core/utils/crypto.js';
import System from './@core/utils/system.js';
import Fs from './@core/utils/fs.js';

export default class Cli {
    public static init () {
        const isConfigExists = Config.isConfigExists();
        if (isConfigExists) {
            return System.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: `"${CONFIG_FILE_NAME}" file already exists!`
                }
            });
        }

        const dirname = System.dirname(import.meta.url);

        const [configFileStubPath, configDestinationPath] = [
            path.resolve(dirname, `stubs/${CONFIG_FILE_NAME}`),
            Config.path
        ];

        const copyingFileResult = Fs.copyFile(configFileStubPath, configDestinationPath);
        if (Array.isArray(copyingFileResult.errors) && copyingFileResult.errors.length > 0) {
            return System.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: copyingFileResult.errors
                }
            });
        }

        Console.log(`The configuration file at ${Config.path} has been created.\nPlease edit it with your credentials.`);
    }

    public static async create (name: string) {
        const options = await Config.options();
        if (!options) {
            return;
        }

        const isMigrationsFolderExists = Fs.canAccess(options.migrations.path, constants.W_OK);
        if (!isMigrationsFolderExists) {
            Fs.makeDirectory(options.migrations.path, { recursive: true });
        }

        const fileName = `${Date.now()}_${name}${name.endsWith('.sql') ? '' : '.sql'}`;
        const destinationPath = path.resolve(options.migrations.path, fileName);

        const dirname = System.dirname(import.meta.url);

        const [configFileStubPath, configDestinationPath] = [
            path.resolve(dirname, 'stubs/empty_migration_file.sql'),
            destinationPath
        ];

        const copyingFileResult = Fs.copyFile(configFileStubPath, configDestinationPath);
        if (Array.isArray(copyingFileResult.errors) && copyingFileResult.errors.length > 0) {
            return System.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: copyingFileResult.errors
                }
            });
        }

        Console.log(`The migration file at ${destinationPath} has been successfully created.\nPlease proceed to write your own migration code.`);
    }

    public static async migrate() {
        const options = await Config.options();
        if (!options) {
            return;
        }

        const migrations = Fs.readdir(options.migrations.path);
        if (Array.isArray(migrations.errors) && migrations.errors.length > 0) {
            return System.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: migrations.errors
                }
            });
        }

        const newMigrations = await Clickhouse.getNewMigrations(migrations.data);
        if (newMigrations.length < 1) {
            return System.exit({ code: 0, log: { type: 'log', message: 'Nothing to migrate.' } });
        }

        const migrationsToApply = [];
        for (const migrationName of newMigrations) {
            const content = Fs.readFile(path.resolve(options.migrations.path, migrationName));
            if (Array.isArray(content.errors) && content.errors.length > 0) {
                return System.exit({
                    code: 0,
                    log: {
                        type: 'error',
                        message: content.errors
                    }
                });
            }

            const checksum = Crypto.hash(content.data);
            if (Array.isArray(checksum.errors) && checksum.errors.length > 0) {
                return System.exit({
                    code: 0,
                    log: {
                        type: 'error',
                        message: checksum.errors
                    }
                });
            }

            migrationsToApply.push({ name: migrationName, query: content.data.toString(), checksum: checksum.data });
        }

        await Clickhouse.migrate(migrationsToApply);
    }
}
