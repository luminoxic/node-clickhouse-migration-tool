# ClickHouse Migration Tool

This npm package provides functionality for managing migrations in ClickHouse databases. It allows you to easily create, run, and manage database migrations using simple commands.

## Installation

You can install the package either globally to use the CLI globally or locally within your project.

### Global Installation

You can install the package globally using npm:

```bash
npm install -g clickhouse-migrate
```

This will make the clickhouse-migrate command available globally on your system.

### Local Installation

For local usage within your project, install the package locally:

```bash
npm install clickhouse-migrate
```

You can then use the CLI within your project's npm scripts or by running it with npx.

## Usage

The primary command for interacting with this tool is `clickhouse-migrate`. Below are the available options and commands:
```
Usage: clickhouse-migrate [options] [command]

Options:
  -V, --version        output the version number
  -c, --config [path]  Specify the config path
  -h, --help           display help for command

Commands:
  init                 Initialize clickhouse-migration-tool configuration
  create <name>        Create a migration template file in the specified migration directory
  migrate              Run all pending migrations
  help [command]       display help for command
```
### Initializing Configuration

To initialize the configuration for the migration tool, use the init command. This will create a configuration file (`clickhouse-migrate-config.js`) in your project directory.

```bash
clickhouse-migrate init
```

The generated configuration file will have the following structure:
```js
export default {
    connection: {
        host: 'http://127.0.0.1:8123', /** Clickhouse connection host */
        username: 'non-root', /** Clickhouse connection username */
        database: 'test', /** Clickhouse connection database */
        password: '12345678' /** Clickhouse connection password */
    },
    options: {
        migrations: {
            tableName: 'migrations', /** Name of the table where the script will store system data related to executed migrations. DO NOT modify after running migrations. */
            path: './migrations' /** Path to the migrations directory */
        },
        database: {
            createIfNotExists: true, /** If this option is set to 'true' and your database does not exist, the script will create the database using the specified engine. */
            engine: 'Atomic' /** Can be: 'Atomic', 'MySQL', 'MaterializedMySQL', 'Lazy', 'PostgreSQL', 'MaterializedPostgreSQL', 'Replicated', 'SQLite' */
        }
    }
};
```

### Creating Migrations

You can create a new migration file using the `create` command followed by a name for the migration. This will generate a migration template file in the specified migration directory.

```bash
clickhouse-migrate create <name>
```

### Running Migrations

To execute all pending migrations, use the `migrate` command.

```bash
clickhouse-migrate migrate
```

## Configuration

By default, the migration tool looks for the configuration file (`clickhouse-migrate-config.js`) in the root of your project. If you need to specify a custom path, you can use the `-c, --config [path]` option.

## Important Notes

- **Generated Migration File Name**: The migration tool generates migration file names automatically. Do not change the generated migration file name.
- **CommonJS Modules Not Supported**: This package currently only supports ESM (ECMAScript Modules) imports.
- **Using Environment Variables**: You can utilize `process.env` in the configuration file. Below is an example:

```js
/* Import env parser or your own logic for parsing .env files goes here */

export default {
    connection: {
        host: process.env.CLICKHOUSE_HOST || 'http://127.0.0.1:8123', /** Clickhouse connection host */
        username: process.env.CLICKHOUSE_USERNAME || 'non-root', /** Clickhouse connection username */
        database: process.env.CLICKHOUSE_DATABASE || 'test', /** Clickhouse connection database */
        password: process.env.CLICKHOUSE_PASSWORD || '12345678' /** Clickhouse connection password */
    },
    options: {
        migrations: {
            tableName: 'migrations', /** Name of the table where the script will store system data related to executed migrations. DO NOT modify after running migrations. */
            path: './migrations' /** Path to the migrations directory */
        },
        database: {
            createIfNotExists: true, /** If this option is set to 'true' and your database does not exist, the script will create the database using the specified engine. */
            engine: 'Atomic' /** Can be: 'Atomic', 'MySQL', 'MaterializedMySQL', 'Lazy', 'PostgreSQL', 'MaterializedPostgreSQL', 'Replicated', 'SQLite' */
        }
    }
};
```