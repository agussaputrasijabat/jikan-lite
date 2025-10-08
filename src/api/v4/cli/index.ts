import { Schema } from "../database/schema";
import { getDatabase } from "../database";
import { runSyncAnime } from "./commands/sync-anime";

export type CommandHandler = (argv: string[]) => Promise<number | void>;

const commands: Record<string, CommandHandler> = {
  // Usage: bun run src/cli sync anime [--limit 100] [--from-index 0] [--force-update]
  "sync:anime": async (argv) => runSyncAnime(argv),
  // Future-ready placeholders: sync:manga, sync:characters, etc.
};

/**
 * Prints CLI usage information and available commands to stdout.
 *
 * Writes formatted usage and options text to the console.
 *
 * @returns {void}
 */
function printHelp() {
  console.log("Jikan Lite CLI (v4)");
  console.log("Usage:");
  console.log("  bun run src/cli <command> [...options]\n");
  console.log("Commands:");
  console.log("  sync:anime              Sync anime data from Jikan v4 into local DB");
  console.log("");
  console.log("Options (sync:anime):");
  console.log("  --limit <n>             Limit number of IDs to process");
  console.log("  --from-index <n>        Start from ID index in the list");
  console.log("  --resume                Resume from last processed index (default: false)");
  console.log("  --force-update          Update even if record already exists");
}

/**
 * Entry point for the v4 CLI.
 * Parses arguments, initializes DB schema, dispatches to command handlers, and returns an exit code.
 * @param {string[]} args - CLI arguments (excluding the node/bun and script path).
 * @returns {Promise<number>} Exit code (0 = success, non-zero = error).
 */
export async function runV4Cli(args: string[]): Promise<number> {
  const [cmd, ...rest] = args;

  if (!cmd || cmd === "-h" || cmd === "--help") {
    printHelp();
    return 0;
  }

  // Ensure DB initialized for any CLI command that may use DB
  const schema = new Schema();
  schema.bootstrap();
  getDatabase();

  const handler = commands[cmd];
  if (!handler) {
    console.error(`Unknown command: ${cmd}`);
    printHelp();
    return 1;
  }

  const result = await handler(rest);
  return typeof result === "number" ? result : 0;
}
