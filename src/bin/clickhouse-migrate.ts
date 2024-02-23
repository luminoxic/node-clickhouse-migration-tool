#!/usr/bin/env node
import { program } from "commander";

import Cli from "../cli-handler.js";

// TODO: uncomment when I can disable experimental warning
// import packageJson from '../package.json' assert { type: "json" };

program
    .version('1.1')
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
