import { readdir } from 'fs/promises';
import { extname, join } from 'path';
import { ScanConfig } from './config';
import { log } from './loggingConfig';

const previouslyProcessedIndicators = ['ffsubsync', 'alass', 'autosubsync'];

async function hasBeenProcessed(directory: string): Promise<boolean> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);
        if (entry.isFile() && extname(entry.name).toLowerCase() === '.srt') {
            const base = entry.name.toLowerCase();
            for (const indicator of previouslyProcessedIndicators) {
                if (base.includes(indicator)) {
                    log(`Skipping directory ${directory} as it has been processed by ${indicator}.`);
                    return true;
                }
            }
        }
    }
    return false;
}

export async function findAllSrtFiles(config: ScanConfig): Promise<string[]> {
    const files: string[] = [];

    async function scan(directory: string): Promise<void> {
        // Check if this directory should be excluded
        if (config.excludePaths.some((excludePath) => directory.startsWith(excludePath))) {
            return;
        }

        // Check if the directory has been processed
        if (await hasBeenProcessed(directory)) {
            return;
        }

        const entries = await readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(directory, entry.name);

            if (entry.isDirectory()) {
                await scan(fullPath);
            } else if (
                entry.isFile() &&
                extname(entry.name).toLowerCase() === '.srt' &&
                !previouslyProcessedIndicators.some(indicator => entry.name.toLowerCase().includes(indicator))
            ) {
                files.push(fullPath);
            }
        }
    }

    // Scan all included paths
    for (const includePath of config.includePaths) {
        await scan(includePath);
    }

    return files;
}
