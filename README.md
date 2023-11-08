# node-clickhouse-migration-tool

## Usage:
- The `clickhouse-migrate init` command now generates a configuration file.
- The `clickhouse-migrate create <migration name>` command generates a placeholder .sql file ordered by timestamp.
- Use the `clickhouse-migrate migrate` command to execute all pending migrations.

- You can specify your custom configuration path using `--config <config path>`.

## Features:
- Added support for configuring the path to the migrations folder, specifying the name of the table for migrations, and creating a database with a specified engine if it doesn't exist.
- Now you can utilize any .env loaders in the configuration file.
- Added support for including SQL sets and queries in a single migration file. This functionality addresses the limitation in the default behavior of @clickhouse/client.
