#!/usr/bin/env node
import { program } from "commander";

import { Cli } from "../cli-handler";

const packageJson = require('../package.json');

program
    .version(packageJson.version)
    .option('-c, --config [path]', 'Specify the config path');

program
    .command('init')
    .description('Initialize clickhouse-migration-tool configuration')
    .action(Cli.init);

program
    .command('create')
    .argument('<name>', 'Migration file name')
    .description('Create empty .sql file in specified migration directory')
    .action(Cli.create);

program
    .command('migrate')
    .description('Run all pending migrations')
    .action(Cli.migrate);

program.parse();
