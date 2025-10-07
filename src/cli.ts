import {runV4Cli} from './api/v4/cli'

async function main() {
  const args = process.argv.slice(2);
  const exitCode = await runV4Cli(args);
  if (typeof exitCode === 'number') process.exit(exitCode);
}

main().catch((err) => {
  console.error('[CLI] Unhandled error:', err);
  process.exit(1);
});
