module.exports = {
    connection: {
        host: 'http://127.0.0.1:8123', /** Clickhouse connection host */
        username: 'non-root', /** Clickhouse connection username */
        database: 'test', /** Clickhouse connection database */
        password: '12345678' /** Clickhouse connection password */
    },
    options: {
        migrations: {
            tableName: 'migrations', /** Name of table where script will store system data related to executed migrations. DO NOT modify after running migrations. */
            path: './migrations' /** Path to migrations directory */
        },
        database: {
            createIfNotExists: true, /** If this option is set to 'true' and your database does not exist, the script will create the database using the specified engine. */
            engine: 'Atomic' /** Can be: 'Atomic', 'MySQL', 'MaterializedMySQL', 'Lazy', 'PostgreSQL', 'MaterializedPostgreSQL', 'Replicated', 'SQLite' */
        }
    }
}
