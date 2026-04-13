# RSP OS — Recursive Simulation Portfolio

A portfolio that simulates its own operating system.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
src/
├── main.jsx                 # React entry point
├── App.jsx                  # Root layout + kernel state
│
├── kernel/
│   ├── data.js              # ← EDIT THIS: your skills, projects, bio
│   ├── filesystem.js        # Virtual filesystem (auto-built from data.js)
│   └── sourceCode.js        # Source snippets shown by `inspect` command
│
├── commands/
│   ├── parser.js            # Tokenizes raw input → { name, args, flags }
│   ├── handlers.js          # One function per command
│   └── registry.js          # Maps command names to handlers + execute()
│
├── visualizer/
│   ├── Visualizer.jsx       # Canvas component + animation loop
│   ├── drawSkillTree.js     # Skill dependency tree renderer
│   ├── drawProjectNet.js    # Project network renderer
│   └── drawMatrix.js        # Matrix rain renderer
│
├── components/
│   ├── Terminal.jsx         # Full terminal: history, tab-complete, dispatch
│   ├── Header.jsx           # Top status bar
│   ├── PaneHeader.jsx       # Reusable pane title bar
│   ├── SourcePane.jsx       # Source/JSON inspector panel
│   └── SyntaxHighlight.jsx  # Lightweight JS/TS tokenizer
│
└── styles/
    └── global.css           # Resets, scrollbar, scanline, cursor blink
```

## Personalizing

**1. Update your data** — edit `src/kernel/data.js`:
- `SKILLS` — your skills with proficiency levels (0–100) and categories
- `PROJECTS` — your projects with descriptions and GitHub links
- `OWNER` — your name, role, contact info

The virtual filesystem (`~/skills/`, `~/projects/`, `~/about.md`) is
built automatically from this data.

**2. Add commands** — in `src/commands/`:
- Write a handler in `handlers.js`
- Register it in `registry.js`

**3. Add visualizations** — in `src/visualizer/`:
- Create a new `drawXxx.js` file
- Import and call it in `Visualizer.jsx`
- Add a `--xxx` flag to `handleVisualize` in `handlers.js`

## Commands Reference

| Command | Description |
|---|---|
| `help` | List all commands |
| `ls [path]` | List directory |
| `cd <path>` | Change directory |
| `cat <file>` | Display file |
| `tree` | Directory tree |
| `visualize --skills` | Skill dependency tree |
| `visualize --projects` | Project network |
| `visualize --matrix` | Matrix rain |
| `inspect <module>` | Show source code |
| `view <target>` | Inspect kernel state |
| `sudo` | Easter egg |
| `hack` | Easter egg |

## Deploy

```bash
npm run build     # outputs to dist/
```

Deploy `dist/` to Vercel, Netlify, GitHub Pages, or any static host.
