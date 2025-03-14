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

```txt
moviename.ffsubsync.[languageCode].srt
moviename.autosubsync.[languageCode].srt
moviename.alass.[languageCode].srt
```


For instance, if the language code is en (for English):

```txt
moviename.ffsubsync.en.srt
moviename.autosubsync.en.srt
moviename.alass.en.srt
```

#### Summary of Output Filename Conventions:

With language code (default to "en" if not supplied):
```txt
moviename.ffsubsync.en.srt
moviename.autosubsync.en.srt
moviename.alass.en.srt
```

Without language code (when supplied as an empty string):
```txt
moviename.ffsubsync.srt
moviename.autosubsync.srt
moviename.alass.srt
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
      - SCAN_PATHS=/movies,/tv,/anime # Remember to mount these as volumes. Must begin with /. Default value is `/scan_dir`
      - EXCLUDE_PATHS=/movies/temp,/tv/downloads # Exclude certain sub-directories from the scan
      - MAX_CONCURRENT_SYNC_TASKS=1 # Defaults to 1 if not set. Higher number will consume more CPU but sync your library faster
      - INCLUDE_ENGINES=ffsubsync,autosubsync # If not set, all engines are used by default
      - LANGUAGE_CODE=en # Specify the ISO 639-1 language code (e.g., "en" for English) (Defaults to en if not supplied but is removed if supplied as "")

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


