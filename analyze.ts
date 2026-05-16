import { dirname } from "path";
import { fileURLToPath } from "url";
import { commands } from "./src/cli/commands";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const printUsage = () => {
    console.log(`
Usage:
  npx tsx analyze.ts <command> <args...>

Options:
  json                  Output analysis result as JSON
  graph                 Generate function dependency graph
  generateIntegrationTest  Generate integration test from state machine
  generateDslTest       Generate DSL-based test suite
  all                   Run all analysis
  help                  Show this help
`);
};

export const main = () => {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    if (!command || command === "help") {
        printUsage();
        process.exit(0);
    }

    const fn = commands[command];

    if (!fn) {
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }

    try {
        fn(...args);
    } catch (error) {
        console.error("analyze failed:");
        if (error instanceof Error) {
            console.error(error.message);
            console.error(error.stack);
        }
    }
};

if (process.argv[1] === __filename) {
    main();
}
