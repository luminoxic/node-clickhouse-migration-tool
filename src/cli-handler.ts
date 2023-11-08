import { constants } from 'fs/promises';
import path from 'path';

import { FsUtils } from './@core/utils/fs';
import { ConsoleUtils } from './@core/utils/console';
import { CONFIG_FILE_NAME, Config } from './@core/config';
import { SystemUtils } from './@core/utils/system';
import { Clickhouse } from './@core/clickhouse';
import { CryptoUtils } from './@core/utils/crypto';

export class Cli {
    public static init () {
        const isConfigExists = Config.isConfigExists();
        if (isConfigExists) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: `"${CONFIG_FILE_NAME}" file already exists!`
                }
            });
        }

        const [configFileStubPath, configDestinationPath] = [
            path.resolve(__dirname,`stubs/${CONFIG_FILE_NAME}`),
            Config.path
        ];

        const copyingFileResult = FsUtils.copyFile(configFileStubPath, configDestinationPath);
        if (Array.isArray(copyingFileResult.errors) && copyingFileResult.errors.length > 0) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: copyingFileResult.errors
                }
            });
        }

        ConsoleUtils.log(`The configuration file at ${Config.path} has been created.\nPlease edit it with your credentials.`);
    }

    public static create (name: string) {
        const isMigrationsFolderExists = FsUtils.canAccess(Config.migrationsDirPath, constants.W_OK);
        if (!isMigrationsFolderExists) {
            FsUtils.makeDirectory(Config.migrationsDirPath, { recursive: true });
        }

        const fileName = `${Date.now()}_${name}${name.endsWith('.sql') ? '' : '.sql'}`;
        const destinationPath = path.resolve(Config.migrationsDirPath, fileName);

        const [configFileStubPath, configDestinationPath] = [
            path.resolve(__dirname, 'stubs/empty_migration_file.sql'),
            destinationPath
        ];

        const copyingFileResult = FsUtils.copyFile(configFileStubPath, configDestinationPath);
        if (Array.isArray(copyingFileResult.errors) && copyingFileResult.errors.length > 0) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: copyingFileResult.errors
                }
            });
        }

        ConsoleUtils.log(`The migration file at ${destinationPath} has been successfully created.\nPlease proceed to write your own migration code.`);
    }

    public static async migrate() {
        const migrations = FsUtils.readdir(Config.migrationsDirPath);
        if (Array.isArray(migrations.errors) && migrations.errors.length > 0) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: migrations.errors
                }
            });
        }

        const newMigrations = await Clickhouse.getNewMigrations(migrations.data);
        if (newMigrations.length < 1) {
            return SystemUtils.exit({ code: 0, log: { type: 'log', message: 'Nothing to migrate.' } });
        }

        const migrationsToApply = [];
        for (const migrationName of newMigrations) {
            const content = FsUtils.readFile(path.resolve(Config.migrationsDirPath, migrationName));
            if (Array.isArray(content.errors) && content.errors.length > 0) {
                return SystemUtils.exit({
                    code: 0,
                    log: {
                        type: 'error',
                        message: content.errors
                    }
                });
            }

            const checksum = CryptoUtils.hash(content.data);
            if (Array.isArray(checksum.errors) && checksum.errors.length > 0) {
                return SystemUtils.exit({
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
