import { basename } from 'path';
import { findMatchingVideoFile } from './findMatchingVideoFile';
import { generateAutosubsyncSubtitles } from './generateAutosubsyncSubtitles';
import { generateFfsubsyncSubtitles } from './generateFfsubsyncSubtitles';
import { generateAlassSubtitles } from './generateAlassSubtitles';
import { log } from './loggingConfig';

export const processSrtFile = async (srtFile: string, languageCode: string) => {
  const videoFile = findMatchingVideoFile(srtFile);
  const includeEngines = process.env.INCLUDE_ENGINES?.split(',') || ['ffsubsync', 'autosubsync', 'alass'];

  if (videoFile) {
    if (includeEngines.includes('ffsubsync')) {
      const ffsubsyncResult = await generateFfsubsyncSubtitles(srtFile, videoFile, languageCode);
      log(`ffsubsync result: ${ffsubsyncResult.message}`);
    }
    if (includeEngines.includes('autosubsync')) {
      const autosubsyncResult = await generateAutosubsyncSubtitles(srtFile, videoFile, languageCode);
      log(`autosubsync result: ${autosubsyncResult.message}`);
    }
    if (includeEngines.includes('alass')) {
      const alassResult = await generateAlassSubtitles(srtFile, videoFile, languageCode);
      log(`alass result: ${alassResult.message}`);
    }
  } else {
    log(`No matching video file found for: ${basename(srtFile)}`);
  }
};
