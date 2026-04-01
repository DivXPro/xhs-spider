# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run build   # Compile TypeScript to dist/
npm run cli     # Build and run CLI
npm run start   # Alias for npm run cli
```

## CLI Usage

```bash
xhs note <url>      # Get single note details
xhs user <url>      # Get all notes from a user
xhs search <query>  # Search notes by keyword
xhs creator         # Get current creator's notes
```

Global options:
- `-c, --cookies <cookies>` - XHS cookies (or set in .env as COOKIES)
- `-f, --format <format>` - Output format: json (default), table, csv, md
- `--download` - Download note media files

## Architecture

### Entry Point (index.ts)
Commander.js CLI with 4 commands. Initializes `XHSApis` and `init()` at startup. `init()` loads cookies from `.env` and creates data directories under `datas/`.

### API Layer (apis/)
- **xhs-pc-apis.ts** - `XHSApis` class: PC web APIs for notes, users, search, comments. Uses `generateRequestParams` from `xhs-util` to sign requests.
- **xhs-creator-apis.ts** - `XHSCreatorApis` class: Creator center APIs

### Utilities (utils/)
- **common-util.ts** - `init()` sets up `datas/{media_datas,excel_datas,json_datas}` directories and loads `COOKIES` from `.env`
- **data-util.ts** - `handleNoteInfo()` transforms raw API response to `NoteInfo`. `downloadNote()` saves note data and media to disk
- **xhs-util.ts** - Request signing using `static/*.js` encrypted functions
- **cookie-util.ts** - Cookie string parsing
- **formatters/** - Output formatters implementing `Formatter` interface: json, table, csv, md

### Static JS (static/)
Contains encrypted/obfuscated JavaScript for XHS request signing (x_b3_Traceid, X-s, etc.). Used at runtime via dynamic import.

### Types (types/index.ts)
`NoteInfo`, `UserInfo`, `CommentInfo` interfaces plus API response types.

## Important Notes

- Cookies are required for all API calls. Set via `-c` flag or `COOKIES=...` in `.env` file at parent directory
- Request signing uses obfuscated JS in `static/` - do not modify these files
- `handleNoteInfo()` normalizes nested API responses into flat `NoteInfo` objects
- Data download saves to `datas/media_datas/{note_id}/`
