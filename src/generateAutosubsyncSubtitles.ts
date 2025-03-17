import { exec } from 'child_process';
import { promisify } from 'util';
import { basename, dirname, join } from 'path';
import { log } from './loggingConfig'; // Ensure logging is consistent
import { enableHardwareAcceleration } from './enableHardwareAcceleration'; // Import the hardware acceleration function

const execAsync = promisify(exec);

export async function generateAutosubsyncSubtitles(srtFile: string, videoFile: string, languageCode: string) {
  const outputDir = dirname(srtFile);
  const baseName = basename(srtFile, '.srt');
  const outputFileName = languageCode ? `${baseName}-autosubsync-${languageCode}.srt` : `${baseName}-autosubsync.srt`;
  const outputFilePath = join(outputDir, outputFileName);

  // Log the start of the file conversion
  log(`Starting autosubsync conversion for: ${srtFile} with video file: ${videoFile}`);

  // Enable hardware acceleration if available
  const hardwareAcceleration = enableHardwareAcceleration();

  // Ensure paths are correctly quoted
  const command = `autosubsync "${videoFile}" -i "${srtFile}" -o "${outputFilePath}" ${hardwareAcceleration}`;

  try {
    const { stdout, stderr } = await execAsync(command);
    log(`Successfully generated: ${outputFilePath}`);
    log(`autosubsync stdout: ${stdout}`);
    log(`autosubsync stderr: ${stderr}`);
    return { message: `Successfully generated: ${outputFilePath}`, stdout, stderr };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log(`Failed to generate autosubsync subtitles: ${errorMessage}`);
    return { message: `Failed to generate autosubsync subtitles: ${errorMessage}`, error };
  }
}