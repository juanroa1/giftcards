import 'dotenv/config';
import { loadConfig } from './config.js';
import { runJob } from './downloader.js';

async function main() {
  const config = loadConfig();
  const result = await runJob(config);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
