import {runV4Cli} from './api/v4/cli'

/**
 * Main entry point for the CLI executable.
 * Delegates to the v4 CLI router and exits with the returned code.
 *
 * Slices process.argv to obtain arguments, runs the v4 CLI router, and exits the process with its returned code.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const args = process.argv.slice(2);
  const exitCode = await runV4Cli(args);
  if (typeof exitCode === 'number') process.exit(exitCode);
}

main().catch((err) => {
  console.error('[CLI] Unhandled error:', err);
  process.exit(1);
});
