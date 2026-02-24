import { command } from './src/commands/init/command.js';

async function main() {
    console.log("Starting init programmatically...");
    // def.action(primaryArg, optionsObj, commandObj)
    await command.action(undefined, {
        client: 'Antigravity',
        transport: 'stdio',
        defaults: true,
        yes: true
    }, {});
    console.log("Done");
}

main().catch(console.error);
