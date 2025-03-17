import { execSync } from 'child_process';
import { log } from './loggingConfig'; // Ensure logging is consistent

/**
 * Check if NVIDIA CUDA is available
 */
function checkNvidiaCuda(): boolean {
  try {
    execSync('nvidia-smi');
    log('NVIDIA CUDA is available');
    return true;
  } catch (error) {
    log('NVIDIA CUDA is not available');
    return false;
  }
}

/**
 * Check if Intel QuickSync is available
 */
function checkIntelQuickSync(): boolean {
  try {
    const output = execSync('vainfo').toString();
    if (output.includes('Intel i965') || output.includes('Intel Media Server Studio')) {
      log('Intel QuickSync is available');
      return true;
    }
    log('Intel QuickSync is not available');
    return false;
  } catch (error) {
    log('Intel QuickSync is not available');
    return false;
  }
}

/**
 * Enable appropriate hardware acceleration for FFmpeg
 */
export function enableHardwareAcceleration(): string {
  if (checkNvidiaCuda()) {
    log('Enabling NVIDIA CUDA hardware acceleration for FFmpeg');
    return '-hwaccel cuda';
  } else if (checkIntelQuickSync()) {
    log('Enabling Intel QuickSync hardware acceleration for FFmpeg');
    return '-hwaccel qsv';
  } else {
    log('No hardware acceleration available, using software encoding');
    return '';
  }
}