import { appendFileSync, accessSync, constants, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

// Define the log file path
const logFilePath = resolve('/config', 'subsyncarr.log');

// Ensure the log directory exists
const logDir = resolve('/config');
if (!existsSync(logDir)) {
  console.log(`Creating log directory: ${logDir}`);
  mkdirSync(logDir, { recursive: true });
}

// Debug: Log the exact path being used for logging
console.log(`Log file path: ${logFilePath}`);

// Verify the log file path and permissions
try {
  accessSync(logFilePath, constants.W_OK);
  console.log(`Log file path is writable: ${logFilePath}`);
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
  console.log(`Attempting to log to file: ${message}`);
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
  console.log(`Logging message: ${message}`);
  if (process.env.LOGGING === 'true') {
    logToFile(message);
  } else {
    console.log(`LOGGING environment variable is not set to 'true'`);
  }
}
