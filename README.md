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

With language code (default to "en"):
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
