import { findAllSrtFiles } from './findAllSrtFiles';
import { getScanConfig } from './config';
import { processSrtFile } from './processSrtFile';
import { log } from './loggingConfig';

async function main(): Promise<void> {
  try {
    // Get language code from environment variable
    const languageCode = process.env.LANGUAGE_CODE === "" ? "" : (process.env.LANGUAGE_CODE ?? "en");

    // Find all .srt files
    const scanConfig = getScanConfig();
    const srtFiles = await findAllSrtFiles(scanConfig);
    log(`Found ${srtFiles.length} SRT files`);

    const maxConcurrentSyncTasks = process.env.MAX_CONCURRENT_SYNC_TASKS
      ? parseInt(process.env.MAX_CONCURRENT_SYNC_TASKS)
      : 1;

    for (let i = 0; i < srtFiles.length; i += maxConcurrentSyncTasks) {
      const chunk = srtFiles.slice(i, i + maxConcurrentSyncTasks);
      await Promise.all(chunk.map((srtFile) => processSrtFile(srtFile, languageCode)));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log(`Error: ${errorMessage}`);
  } finally {
    log(`subsyncarr completed.`);
  }
}

main();
