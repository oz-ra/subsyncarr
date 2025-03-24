import { basename, dirname, join } from 'path';
import { execPromise, ProcessingResult } from './helpers';
import { existsSync } from 'fs';

// Helper function to extract language code from the base filename
function extractLanguageCode(filename: string): string {
  const match = filename.match(/\.([a-z]{2})\.srt$/);
  return match ? match[1] : 'en'; // Default to 'en' if no language code is found
}

// Helper function to remove the language code from the base filename
function removeLanguageCode(filename: string): string {
  return filename.replace(/\.([a-z]{2})$/, ''); // Removes the language code (e.g., ".en")
}

export async function generateFfsubsyncSubtitles(srtPath: string, videoPath: string): Promise<ProcessingResult> {
  const directory = dirname(srtPath);
  const srtBaseName = basename(srtPath, '.srt');
  const languageCode = extractLanguageCode(srtBaseName);
  const baseNameWithoutLang = removeLanguageCode(srtBaseName); // Remove language code
  const outputPath = join(directory, `${baseNameWithoutLang}.ffsync-${languageCode}.srt`); // Append language code to .ffsync

  // Check if synced subtitle already exists
  const exists = existsSync(outputPath);
  if (exists) {
    return {
      success: true,
      message: `Skipping ${outputPath} - already processed`,
    };
  }

  try {
    const command = `ffsubsync "${videoPath}" -i "${srtPath}" -o "${outputPath}"`;
    console.log(`${new Date().toLocaleString()} Processing: ${command}`);
    await execPromise(command);
    return {
      success: true,
      message: `Successfully processed: ${outputPath}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Error processing ${outputPath}: ${errorMessage}`,
    };
  }
}
