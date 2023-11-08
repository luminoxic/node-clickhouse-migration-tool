import { ClickHouseClient, ClickHouseSettings, createClient } from "@clickhouse/client";
import { Config } from "../config";
import { SystemUtils } from "../utils/system";

export class BaseClickhouse {
    /** Private declarations */
    private static _client: ClickHouseClient | null = null;

    /** Protected declarations */
    protected static async _createClient(withDb = false): Promise<void> {
        const { connection } = Config.data;

        BaseClickhouse._client = createClient({
            host: connection.host,
            username: connection.username,
            password: connection.password,
            database: withDb ? connection.database : undefined
        });

        const isConnectedSuccessfully = await BaseClickhouse._client.ping();
        if (!isConnectedSuccessfully) {
            return SystemUtils.exit({
                code: 0,
                log: {
                    type: 'error',
                    message: 'The connection to the ClickHouse instance has failed. Please verify your credentials and ensure the accessibility of the instance.'
                }
            });
        }
    }

    protected static async _exec(query: string, settings?: ClickHouseSettings): Promise<{ errors: Error[] }> {
        const errors = [];

        try {
            await BaseClickhouse._client.exec({ query, clickhouse_settings: settings });
        } catch (err) {
            errors.push(err);
        }
        
        return { errors };
    }

    
    protected static async _query(query: string): Promise<{ data?: any, errors?: Error[] }> {
        const result: { data?: any, errors?: Error[] } = {};

        try {
            const queryResult = await BaseClickhouse._client.query({ query, format: 'JSONEachRow' });
            
            result.data = await queryResult.json();
        } catch (err) {
            result.errors = [err];
        }
        
        return result;
    }

    protected static async _insert(table: string, values: any[]): Promise<{ errors: Error[] }> {
        const errors = [];

        try {
            await BaseClickhouse._client.insert({ table, values, format: 'JSONEachRow' });
        } catch (err) {
            errors.push(err);
        }
        
        return { errors };
    }
    /** Public declarations */
    public static get client () {
        return BaseClickhouse._client;
    }
}
