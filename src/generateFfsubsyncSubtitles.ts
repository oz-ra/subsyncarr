import { basename, dirname, join } from 'path';
import { execPromise, ProcessingResult } from './helpers';
import { existsSync } from 'fs';

// Helper function to extract language code from the base filename
function extractLanguageCode(filename: string): string {
  const match = filename.match(/\.([a-z]{2,3})$/); // Match 2 or 3 letter language codes at the end
  return match ? match[1] : ''; // Return an empty string if no language code is found
}

// Helper function to remove the language code from the base filename
function removeLanguageCode(filename: string): string {
  return filename.replace(/\.([a-z]{2,3})$/, ''); // Removes 2 or 3 letter language codes (e.g., ".en" or ".eng")
}

// Helper function to check if the filename contains "SDH"
function isSdhSubtitle(filename: string): boolean {
  return filename.toLowerCase().includes('sdh'); // Check for "sdh" (case-insensitive)
}

export async function generateFfsubsyncSubtitles(srtPath: string, videoPath: string): Promise<ProcessingResult> {
  const directory = dirname(srtPath);
  const srtBaseName = basename(srtPath, '.srt');
  const languageCode = extractLanguageCode(srtBaseName);
  const baseNameWithoutLang = removeLanguageCode(srtBaseName); // Remove language code
  const isSdh = isSdhSubtitle(srtBaseName); // Check if the subtitle is SDH
  const sdhSuffix = isSdh ? '-sdh' : ''; // Append "-sdh" if it's an SDH subtitle
  const langSuffix = languageCode ? `-${languageCode}` : ''; // Append language code only if it exists
  const outputPath = join(directory, `${baseNameWithoutLang}.ffsync${langSuffix}${sdhSuffix}.srt`); // Append language code and SDH suffix

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
