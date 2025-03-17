import { exec } from 'child_process';
import { promisify } from 'util';
import { basename, dirname, join } from 'path';
import { log } from './loggingConfig'; // Ensure logging is consistent

const execAsync = promisify(exec);

export async function generateFfsubsyncSubtitles(srtFile: string, videoFile: string, languageCode: string) {
  const outputDir = dirname(srtFile);
  const baseName = basename(srtFile, '.srt');
  const outputFileName = languageCode ? `${baseName}.ffsubsync.${languageCode}.srt` : `${baseName}.ffsubsync.srt`;
  const outputFilePath = join(outputDir, outputFileName);

  const command = `ffsubsync \\\"${videoFile}\\\" -i \\\"${srtFile}\\\" -o \\\"${outputFilePath}\\\"`;

  try {
    const { stdout, stderr } = await execAsync(command);
    log(`Successfully generated: ${outputFilePath}`);
    return { message: `Successfully generated: ${outputFilePath}`, stdout, stderr };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log(`Failed to generate ffsubsync subtitles: ${errorMessage}`);
    return { message: `Failed to generate ffsubsync subtitles: ${errorMessage}`, error };
  }
}