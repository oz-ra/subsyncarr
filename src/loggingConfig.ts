import { appendFileSync, accessSync, constants } from 'fs';
import { join } from 'path';

const logFilePath = join(__dirname, 'subsyncarr.log');

// Debug: Log the exact path being used for logging
console.log(`Log file path: ${logFilePath}`);

// Verify the log file path and permissions
try {
  accessSync(logFilePath, constants.W_OK);
} catch (error) {
  console.error(`Log file path is not writable: ${logFilePath}`);
  if (error instanceof Error) {
    console.error(`Access error: ${error.message}`);
  } else {
    console.error(`Access error: ${String(error)}`);
  }
}

export function logToFile(message: string) {
  const timestamp = new Date().toLocaleString();
  try {
    appendFileSync(logFilePath, `${timestamp} ${message}\n`);
    console.log(`Successfully wrote to log file: ${logFilePath}`);
  } catch (error) {
    // Ensure the error is of type Error
    if (error instanceof Error) {
      console.error(`Failed to write to log file: ${error.message}`);
    } else {
      console.error(`Failed to write to log file: ${String(error)}`);
    }
  }
}

export function log(message: string) {
  const timestamp = new Date().toLocaleString();
  console.log(`${timestamp} ${message}`);
  if (process.env.LOGGING === 'true') {
    logToFile(message);
  }
}