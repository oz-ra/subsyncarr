import { basename, dirname, join } from 'path';
import { execPromise, ProcessingResult } from './helpers';
import { existsSync } from 'fs';

// Helper function to extract language code from the filename
function extractLanguageCode(filename: string): string {
  const match = filename.match(/\.(\w{2,3})(?=\.sdh|\.srt$)/i); // Match 2-3 letter language code before ".sdh" or ".srt"
  return match ? match[1] : ''; // Return the language code or an empty string if not found
}

// Helper function to check if the filename contains ".sdh"
function isSdhSubtitle(filename: string): boolean {
  return /\.sdh\./i.test(filename); // Check for ".sdh." (case-insensitive)
}

// Helper function to remove the language code and ".sdh" suffix from the base filename
function removeLanguageAndSdh(filename: string): string {
  return filename.replace(/\.(\w{2,3})(?=\.sdh|\.srt$)/i, '').replace(/\.sdh/i, ''); // Remove language code and ".sdh"
}

export async function generateAutosubsyncSubtitles(srtPath: string, videoPath: string): Promise<ProcessingResult> {
  const directory = dirname(srtPath);
  const srtBaseName = basename(srtPath, '.srt'); // Get the base name without the ".srt" extension
  const languageCode = extractLanguageCode(srtBaseName); // Extract the language code (e.g., "en", "eng")
  const isSdh = isSdhSubtitle(srtBaseName); // Check if the subtitle is SDH
  const baseNameWithoutLang = removeLanguageAndSdh(srtBaseName); // Remove language code and ".sdh"
  const sdhSuffix = isSdh ? '-sdh' : ''; // Add "-sdh" if it's an SDH subtitle
  const langSuffix = languageCode ? `-${languageCode}` : ''; // Add the language code if it exists
  const outputPath = join(directory, `${baseNameWithoutLang}.autsync${langSuffix}${sdhSuffix}.srt`); // Construct the output filename
 

  // Check if synced subtitle already exists
  const exists = existsSync(outputPath);
  if (exists) {
    return {
      success: true,
      message: `Skipping ${outputPath} - already processed`,
    };
  }

  try {
    const command = `autosubsync "${videoPath}" "${srtPath}" "${outputPath}"`;
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
