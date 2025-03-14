import { exec } from 'child_process';
import { promisify } from 'util';
import { basename, dirname, join } from 'path';

const execAsync = promisify(exec);

export async function generateFfsubsyncSubtitles(srtFile: string, videoFile: string, languageCode: string) {
  const outputDir = dirname(srtFile);
  const baseName = basename(srtFile, '.srt');
  const outputFileName = languageCode ? `${baseName}.ffsubsync.${languageCode}.srt` : `${baseName}.ffsubsync.srt`;
  const outputFilePath = join(outputDir, outputFileName);

  const command = `ffsubsync "${videoFile}" -i "${srtFile}" -o "${outputFilePath}"`;

  try {
    const { stdout, stderr } = await execAsync(command);
    return { message: `Successfully generated: ${outputFilePath}`, stdout, stderr };
  } catch (error) {
    return { message: `Failed to generate ffsubsync subtitles: ${error.message}`, error };
  }
}
