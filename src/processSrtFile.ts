import { exec } from 'child_process';
import { dirname } from 'path';
import { log } from './loggingConfig';
import { hasServiceBeenProcessed } from './utils';

export async function processSrtFile(srtFilePath: string, languageCode: string): Promise<void> {
    const directory = dirname(srtFilePath);
    let command = '';

    if (await hasServiceBeenProcessed(directory, 'ffsubsync')) {
        log(`Skipping ffsubsync for ${srtFilePath} as it has already been processed.`);
        return;
    } else if (await hasServiceBeenProcessed(directory, 'alass')) {
        log(`Skipping alass for ${srtFilePath} as it has already been processed.`);
        return;
    } else if (await hasServiceBeenProcessed(directory, 'autosubsync')) {
        log(`Skipping autosubsync for ${srtFilePath} as it has already been processed.`);
        return;
    }

    if (srtFilePath.includes('ffsubsync')) {
        command = `ffsubsync --subtitles ${srtFilePath} --ref ${srtFilePath} --output ${srtFilePath}`;
    } else if (srtFilePath.includes('alass')) {
        command = `alass ${srtFilePath} ${srtFilePath}`;
    } else if (srtFilePath.includes('autosubsync')) {
        command = `autosubsync ${srtFilePath}`;
    } else {
        command = `ffsubsync --subtitles ${srtFilePath} --ref ${srtFilePath} --output ${srtFilePath}`;
    }

    log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            log(`Error processing ${srtFilePath}: ${error.message}`);
            return;
        }
        if (stderr) {
            log(`Error output for ${srtFilePath}: ${stderr}`);
        }
        log(`Processed ${srtFilePath}: ${stdout}`);
    });
}