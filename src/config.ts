export interface ScanConfig {
  includePaths: string[];
  excludePaths: string[];
  excludeFilePatterns: string[]; // Add this property
}

function validatePath(path: string): boolean {
  // Add any path validation logic you need
  return path.startsWith('/') && !path.includes('..');
}

export function getScanConfig(): ScanConfig {
  const scanPaths = process.env.SCAN_PATHS?.split(',').filter(Boolean) || ['/scan_dir'];
  const excludePaths = process.env.EXCLUDE_PATHS?.split(',').filter(Boolean) || [];
  const excludeFilePatterns = process.env.EXCLUDE_FILES?.split(',').map((pattern) => pattern.trim()) || []; // Read EXCLUDE_FILES

  // Validate paths
  const validIncludePaths = scanPaths.filter((path) => {
    const isValid = validatePath(path);
    if (!isValid) {
      console.warn(`${new Date().toLocaleString()} Invalid include path: ${path}`);
    }
    return isValid;
  });

  const validExcludePaths = excludePaths.filter((path) => {
    const isValid = validatePath(path);
    if (!isValid) {
      console.warn(`${new Date().toLocaleString()} Invalid exclude path: ${path}`);
    }
    return isValid;
  });

  if (validIncludePaths.length === 0) {
    console.warn(`${new Date().toLocaleString()} No valid scan paths provided, defaulting to /scan_dir`);
    validIncludePaths.push('/scan_dir');
  }

  console.log(`${new Date().toLocaleString()} Scan configuration:`, {
    includePaths: validIncludePaths,
    excludePaths: validExcludePaths,
    excludeFilePatterns, // Log the exclude file patterns
  });

  return {
    includePaths: validIncludePaths,
    excludePaths: validExcludePaths,
    excludeFilePatterns, // Include in the returned config
  };
}
