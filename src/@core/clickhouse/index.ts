
import { Config } from "../config";
import { ConsoleUtils } from "../utils/console";
import { SqlUtils } from "../utils/sql";
import { SystemUtils } from "../utils/system";
import { BaseClickhouse } from "./base";

export class Clickhouse extends BaseClickhouse {
    private static async _createDatabase() {
        if (!Clickhouse.client) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: 'The connection to the ClickHouse instance has failed.Please verify your credentials and ensure the accessibility of the instance.'
                }
            });
        }

        const { connection, options } = Config.data;
        if (!options?.database?.createIfNotExists) {
            return;
        }

        const query = `CREATE DATABASE IF NOT EXISTS ${connection.database} ENGINE = ${options.database.engine}`;

        const creatingDatabaseResult = await Clickhouse._exec(query, { wait_end_of_query: 1 });
        if (Array.isArray(creatingDatabaseResult.errors) && creatingDatabaseResult.errors.length > 0) {
            return SystemUtils.exit({ code: 0, log: { type: 'error', message: creatingDatabaseResult.errors } });
        }
    }

    private static async _createSystemTable() {
        if (!Clickhouse.client) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: 'The connection to the ClickHouse instance has failed.Please verify your credentials and ensure the accessibility of the instance.'
                }
            });
        }

        const { options } = Config.data;

        const creatingSystemTableResult = await Clickhouse._exec(`CREATE TABLE IF NOT EXISTS ${options.migrations.tableName} (
            name String,
            checksum String,
            applied_at DateTime DEFAULT now()
          ) 
          ENGINE = MergeTree 
          ORDER BY tuple(applied_at)`
        );
        if (Array.isArray(creatingSystemTableResult.errors) && creatingSystemTableResult.errors.length > 0) {
            return SystemUtils.exit({ code: 0, log: { type: 'error', message: creatingSystemTableResult.errors } });
        }
    }

    private static async _initialize() {
        await Clickhouse._createClient();
        await Clickhouse._createDatabase();

        await Clickhouse._createClient(true);
        await Clickhouse._createSystemTable();
    }
    
    /** Public methods */
    public static async getNewMigrations(migrations: string[]): Promise<string[]> {
        const { options } = Config.data;

        if (!Clickhouse.client) {
            await Clickhouse._initialize();
        }

        const appliedMigrations = await Clickhouse._query(`SELECT name, checksum FROM ${options.migrations.tableName}`);
        if (Array.isArray(appliedMigrations.errors) && appliedMigrations.errors.length > 0) {
            SystemUtils.exit({ code: 0, log: { type: 'error', message: appliedMigrations.errors } });

            return [];
        }

        const newMigrations = migrations.filter(m => !appliedMigrations.data.find(aM => aM.name === m));
        if (newMigrations.length < 1) {
            SystemUtils.exit({ code: 0, log: { type: 'log', message: 'Nothing to migrate.' } });

            return [];
        }

        return newMigrations;
    }

    public static async migrate(migrations: { name: string, query: string, checksum: string }[]) {
        const { options } = Config.data;

        if (!Clickhouse.client) {
            await Clickhouse._initialize();
        }

        for (const migration of migrations) {
            const startTime = Date.now();

            ConsoleUtils.infoWithPrefix('[Migrating]: ', migration.name);

            const [migrationQueries, migrationSets] = [
                SqlUtils.getSqlQueriesFromString(migration.query),
                SqlUtils.getSqlSetsFromString(migration.query)
            ];

            for (const migrationQuery of migrationQueries) {
                const migrationResult = await Clickhouse._exec(migrationQuery, { ...migrationSets, wait_end_of_query: 1 });
                if (Array.isArray(migrationResult.errors) && migrationResult.errors.length > 0) {
                    return SystemUtils.exit({ code: 0, log: { type: 'error', message: migrationResult.errors } });
                }
            }

            const saveMigrationResult = await Clickhouse._insert(options.migrations.tableName, [{ name: migration.name, checksum: migration.checksum }]);
            if (Array.isArray(saveMigrationResult.errors) && saveMigrationResult.errors.length > 0) {
                return SystemUtils.exit({ code: 0, log: { type: 'error', message: saveMigrationResult.errors } });
            }

            const migrationTime = ((Date.now() - startTime) / 1000).toFixed(2);

            ConsoleUtils.logWithPrefix('[Migrated]: ', `${migration.name}(${migrationTime} seconds)`);
        }
    }
}
