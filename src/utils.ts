import { readdir } from 'fs/promises';
import { extname, dirname, join } from 'path';
import { log } from './loggingConfig';

const previouslyProcessedIndicators = ['ffsubsync', 'alass', 'autosubsync'];

export async function hasServiceBeenProcessed(directory: string, serviceName: string): Promise<boolean> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);
        if (entry.isFile() && extname(entry.name).toLowerCase() === '.srt') {
            const base = entry.name.toLowerCase();
            if (base.includes(serviceName)) {
                log(`Skipping processing for ${directory} as it has been processed by ${serviceName}.`);
                return true;
            }
        }
    }
    return false;
}