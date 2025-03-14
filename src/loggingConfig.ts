import { appendFileSync } from 'fs';
import { join } from 'path';

const logFilePath = join(__dirname, 'subsyncarr.log');

export function logToFile(message: string) {
  const timestamp = new Date().toLocaleString();
  appendFileSync(logFilePath, `${timestamp} ${message}\n`);
}

export function log(message: string) {
  const timestamp = new Date().toLocaleString();
  console.log(`${timestamp} ${message}`);
  if (process.env.LOGGING === 'true') {
    logToFile(message);
  }
}