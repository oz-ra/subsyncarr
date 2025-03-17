import { appendFileSync } from 'fs';
import { join } from 'path';

const logFilePath = join(__dirname, 'subsyncarr.log');

export function logToFile(message: string) {
  const timestamp = new Date().toLocaleString();
  try {
    appendFileSync(logFilePath, `${timestamp} ${message}\n`);
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

export function log(message: string) {
  const timestamp = new Date().toLocaleString();
  console.log(`${timestamp} ${message}`);
  if (process.env.LOGGING === 'true') {
    logToFile(message);
  }
}
