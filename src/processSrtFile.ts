import { basename } from 'path';
import { findMatchingVideoFile } from './findMatchingVideoFile';
import { generateAutosubsyncSubtitles } from './generateAutosubsyncSubtitles';
import { generateFfsubsyncSubtitles } from './generateFfsubsyncSubtitles';
import { generateAlassSubtitles } from './generateAlassSubtitles';
import { log } from './loggingConfig';

export const processSrtFile = async (srtFile: string, languageCode: string) => {
  log(`Processing SRT file: ${srtFile} for language code: ${languageCode}`);

  const videoFile = findMatchingVideoFile(srtFile);
  const includeEngines = process.env.INCLUDE_ENGINES?.split(',') || ['ffsubsync', 'autosubsync', 'alass'];

  if (videoFile) {
    if (includeEngines.includes('ffsubsync')) {
      log(`Starting ffsubsync for: ${srtFile}`);
      const ffsubsyncResult = await generateFfsubsyncSubtitles(srtFile, videoFile, languageCode);
      log(`ffsubsync result: ${ffsubsyncResult.message}`);
    }
    if (includeEngines.includes('autosubsync')) {
      log(`Starting autosubsync for: ${srtFile}`);
      const autosubsyncResult = await generateAutosubsyncSubtitles(srtFile, videoFile, languageCode);
      log(`autosubsync result: ${autosubsyncResult.message}`);
    }
    if (includeEngines.includes('alass')) {
      log(`Starting alass for: ${srtFile}`);
      const alassResult = await generateAlassSubtitles(srtFile, videoFile, languageCode);
      log(`alass result: ${alassResult.message}`);
    }
  } else {
    log(`No matching video file found for: ${basename(srtFile)}`);
  }
};