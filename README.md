# Subsyncarr

An automated subtitle synchronization tool that runs as a Docker container. It watches a directory for video files with matching subtitles and automatically synchronizes them using both ffsubsync and autosubsync.

## Features

- Automatically scans directory for video files and their corresponding subtitles
- Uses both ffsubsync and autosubsync for maximum compatibility
- Runs on a schedule (daily at midnight) and on container startup
- Supports common video formats (mkv, mp4, avi, mov)
- Docker-based for easy deployment
- Generates synchronized subtitle files with `.ffsubsync.srt` and `.autosubsync.srt` extensions

## Quick Start

### Using Docker Compose (Recommended)

#### 1. Create a new directory for your project

```bash
mkdir subsyncarr && cd subsyncarr
```

#### 2. Download the docker-compose.yml file

```bash
curl -O https://raw.githubusercontent.com/johnpc/subsyncarr/refs/heads/main/docker-compose.yaml
```

#### 3. Edit the docker-compose.yml file with your timezone and paths

```bash
TZ=America/New_York  # Adjust to your timezone
```

#### 4. Start the container

```bash
docker compose up -d
```

## Configuration

The container is configured to:

- Scan for subtitle files in the mounted directory
- Run synchronization at container startup
- Run daily at midnight (configurable via cron)
- Generate synchronized subtitle versions using different tools (currently ffsubsync and autosubsync)

### Directory Structure

Your media directory should be organized as follows:

```txt
/media
├── movie1.mkv
├── movie1.srt
├── movie2.mp4
└── movie2.srt
```

It should follow the naming conventions expected by other services like Bazarr and Jellyfin.

## Logs

View container logs:

```bash
docker logs -f subsyncarr
```

## Changes

After the changes, the output filenames will have the language code at the end of the filename. Here are the examples of how the filenames will look after the change:

- Before the Change

```txt
moviename.ffsubsync.srt
moviename.autosubsync.srt
moviename.alass.srt
```


- After the Change
#### Summary of Output Filename Conventions:

With language code (default to "en" if not supplied):
```txt
For both ffsubsync and autosubsync and Alass:

Input file: movie.en.srt
Output file: movie.ffsync-en.srt or movie.autsync-en.srt
Input file: movie.eng.sdh.srt
Output file: movie.ffsync-eng-sdh.srt or movie.autsync-eng-sdh.srt
Input file: movie.sdh.srt (no language code)
Output file: movie.ffsync-en-sdh.srt or movie.autsync-en-sdh.srt (default language code is 'en').
```


#### docker-compose.yaml

```txt
name: subsyncarr

services:
  subsyncarr:
    image: mrorbitman/subsyncarr:latest
    container_name: subsyncarr
    volumes:
      # Any path configured with SCAN_PATHS env var must be mounted
      # If no scan paths are specified, it defaults to scan `/scan_dir` like example below.
      # - /path/to/your/media:/scan_dir
      - /path/to/movies:/movies
      - /path/to/tv:/tv
      - /path/to/anime:/anime
    restart: unless-stopped
    environment:
      - TZ=Etc/UTC # Replace with your own timezone
      - CRON_SCHEDULE=0 0 * * * # Runs every day at midnight by default
      - SCAN_PATHS=/movies,/tv,/anime # Remember to mount these as volumes. Must begin with /. Default valus is `/scan_dir`
      - EXCLUDE_PATHS=/movies/temp,/tv/downloads # Exclude certain sub-directories from the scan
      - EXCLUDE_FILES= # Exclude certain subtitle files from the scan.
      - MAX_CONCURRENT_SYNC_TASKS=1 # Defaults to 1 if not set. Higher number will consume more CPU but sync your library faster
      - INCLUDE_ENGINES=ffsubsync,autosubsync # If not set, all engines are used by default

```


# Environment Variables for subsyncarr

This document provides a detailed explanation of the environment variables used in the `docker-compose.yaml` file for the `subsyncarr` service. It includes all options and resultant actions.

## Environment Variables

### `TZ`
- **Description**: Sets the timezone for the container.
- **Example Value**: `Etc/UTC`
- **Result**: The container will use the specified timezone for logging and scheduling.
- **Default**: If not supplied, the timezone will default to UTC.

### `CRON_SCHEDULE`
- **Description**: Defines the cron schedule for running the sync tasks.
- **Example Value**: `0 0 * * *`
- **Result**: The sync tasks will run every day at midnight by default.
- **Default**: If not supplied, the default schedule is `0 0 * * *` (every day at midnight).

### `SCAN_PATHS`
- **Description**: Specifies the paths to scan for `.srt` files.
- **Example Value**: `/movies,/tv,/anime`
- **Result**: The application will scan the specified paths for `.srt` files to process. These paths must be mounted as volumes in the container.
- **Default**: If not supplied, the default path is `/scan_dir`.

### `EXCLUDE_PATHS`
- **Description**: Specifies paths to exclude from the scan.
- **Example Value**: `/movies/temp,/tv/downloads`
- **Result**: The application will exclude the specified paths from the scan.
- **Default**: If not supplied, no paths will be excluded.

### `EXCLUDE_PATHS`
- **Description**: Specifies files/file-patterns to exclude from the scan. (files not to be processed)
- **Example Value**: `aisub.srt,moviename.something.srt`
- **Result**: The application will exclude the specified files from the scan.
- **Default**: If not supplied, no files will be excluded.

### `MAX_CONCURRENT_SYNC_TASKS`
- **Description**: Sets the maximum number of concurrent sync tasks.
- **Example Value**: `1`
- **Result**: Limits the number of sync tasks running simultaneously. Higher values will consume more CPU but will sync the library faster.
- **Default**: If not supplied, the default value is `1`.

### `INCLUDE_ENGINES`
- **Description**: Specifies which engines to use for syncing.
- **Example Value**: `ffsubsync,autosubsync`
- **Result**: Only the specified engines will be used for syncing. If not set, all engines are used by default.
- **Default**: If not supplied, all available engines will be used.

### `LOGGING`
- **Description**: Enables logging to a file if set to `true`.
- **Example Value**: `true`
- **Result**: If set to `true`, logs will be written to the file `subsyncarr.log` in the `config` directory in addition to being printed to the console.
- **Default**: If not supplied, logging will only occur in the console.

### `LANGUAGE_CODE`
- **Description**: Sets the language code for processing `.srt` files.
- **Example Value**: `en`
- **Result**: The application will use the specified language code for processing `.srt` files. The default value is `en` (English).
- **Default**: If not supplied, the default language code is `en`.

#### `LANGUAGE_CODE` Options
- `en` - English (default)
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean

Depending on the implementation, you can extend this list to include other language codes supported by your application. The `LANGUAGE_CODE` variable ensures that the subtitles are processed in the specified language, which might affect tasks like synchronization, translation, or any other language-specific processing.


Let's step through the code and analyze how the output filenames are constructed based on the input filenames. I'll explain the logic and list all possible output filenames.

---

### **Code Logic Breakdown**

1. **Input Filename Parsing**:
   - The input filename is passed as `srtPath`.
   - The `basename` function extracts the base name of the file (without the `.srt` extension).

2. **Language Code Extraction**:
   - The `extractLanguageCode` function uses a regex to find a 2-3 letter language code (e.g., `.en`, `.eng`) that appears **before `.sdh` or `.srt`**.
   - If no language code is found, it returns an empty string.

3. **SDH Detection**:
   - The `isSdhSubtitle` function checks if the filename contains `.sdh.` (case-insensitive).
   - If `.sdh.` is found, it returns `true`; otherwise, it returns `false`.

4. **Base Name Without Language and SDH**:
   - The `removeLanguageAndSdh` function removes both the language code (e.g., `.en`, `.eng`) and `.sdh` from the filename.

5. **Output Filename Construction**:
   - The `outputPath` is constructed as:
     ```typescript
     `${baseNameWithoutLang}.ffsync${langSuffix}${sdhSuffix}.srt`
     ```
     - `baseNameWithoutLang`: The base name with the language code and `.sdh` removed.
     - `langSuffix`: `-${languageCode}` if a language code exists; otherwise, an empty string.
     - `sdhSuffix`: `-sdh` if `.sdh` is detected; otherwise, an empty string.

---

### **Possible Input Filenames and Corresponding Output Filenames**

#### Case 1: Input Filename with Language Code Only
- **Input**: `movie.en.srt`
  - `languageCode`: `en`
  - `isSdh`: `false`
  - `baseNameWithoutLang`: `movie`
  - `langSuffix`: `-en`
  - `sdhSuffix`: ``
- **Output**: `movie.ffsync-en.srt`

---

#### Case 2: Input Filename with No Language Code
- **Input**: `movie.srt`
  - `languageCode`: ``
  - `isSdh`: `false`
  - `baseNameWithoutLang`: `movie`
  - `langSuffix`: ``
  - `sdhSuffix`: ``
- **Output**: `movie.ffsync.srt`

---

#### Case 3: Input Filename with Extended Language Code
- **Input**: `movie.eng.srt`
  - `languageCode`: `eng`
  - `isSdh`: `false`
  - `baseNameWithoutLang`: `movie`
  - `langSuffix`: `-eng`
  - `sdhSuffix`: ``
- **Output**: `movie.ffsync-eng.srt`

---

#### Case 4: Input Filename with Language Code and SDH
- **Input**: `movie.en.sdh.srt`
  - `languageCode`: `en`
  - `isSdh`: `true`
  - `baseNameWithoutLang`: `movie`
  - `langSuffix`: `-en`
  - `sdhSuffix`: `-sdh`
- **Output**: `movie.ffsync-en-sdh.srt`

---

#### Case 5: Input Filename with SDH Only
- **Input**: `movie.sdh.srt`
  - `languageCode`: ``
  - `isSdh`: `true`
  - `baseNameWithoutLang`: `movie`
  - `langSuffix`: ``
  - `sdhSuffix`: `-sdh`
- **Output**: `movie.ffsync-sdh.srt`

---

#### Case 6: Input Filename with Extended Language Code and SDH
- **Input**: `movie.eng.sdh.srt`
  - `languageCode`: `eng`
  - `isSdh`: `true`
  - `baseNameWithoutLang`: `movie`
  - `langSuffix`: `-eng`
  - `sdhSuffix`: `-sdh`
- **Output**: `movie.ffsync-eng-sdh.srt`

---

### **Summary of All Possible Output Filenames**

| **Input Filename**       | **Output Filename**         |
|---------------------------|-----------------------------|
| `movie.en.srt`           | `movie.ffsync-en.srt`       |
| `movie.srt`              | `movie.ffsync.srt`          |
| `movie.eng.srt`          | `movie.ffsync-eng.srt`      |
| `movie.en.sdh.srt`       | `movie.ffsync-en-sdh.srt`   |
| `movie.sdh.srt`          | `movie.ffsync-sdh.srt`      |
| `movie.eng.sdh.srt`      | `movie.ffsync-eng-sdh.srt`  |

---

### **Edge Cases**
1. **Filename with No `.srt` Extension**:
   - The code assumes the input filename always ends with `.srt`. If it doesn't, the behavior may be undefined.

2. **Filename with Unexpected Format**:
   - Example: `movie.random.srt`
     - `languageCode`: `random`
     - `isSdh`: `false`
     - Output: `movie.ffsync-random.srt`

3. **Filename with Multiple Language Codes**:
   - Example: `movie.en.eng.srt`
     - The regex will match the last language code (`eng`).
     - Output: `movie.en.ffsync-eng.srt`.

