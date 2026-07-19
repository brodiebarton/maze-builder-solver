# maze-builder-solver

A single, client-side web app (p5.js + Vite) that builds a maze, solves it with A*, and lets you play it with arrow keys. There is no backend, database, tests, or lint config.

## Cursor Cloud specific instructions

- Single service only: a Vite dev server for a static p5.js frontend. No backend/DB/queue/auth, no automated tests, and no lint config exist in this repo.
- Standard commands live in `package.json`: `npm run dev` (Vite dev server, serves on `http://localhost:5173`), `npm run build` (outputs to git-ignored `dist/`), `npm run preview`. There are intentionally no `test` or `lint` scripts.
- Node version: `package.json` `engines` requires `>=24`. Node 24 is installed via nvm and is the default in login/interactive shells. The non-interactive shell used by the agent's Shell tool resolves `node` to a preinstalled v22 (`/exec-daemon/node`), which also satisfies Vite 8's real requirement (`^20.19 || >=22.12`), so `npm` commands work either way; the `EBADENGINE` warning under v22 is harmless. To force Node 24 for a command, run it through a login shell (e.g. `bash -lc 'npm run dev'`) or `nvm use 24` first.
- Run the dev server in a persistent tmux session so it survives; the app is purely client-side, so verify by loading `http://localhost:5173` in a browser (BUILD generates a maze, SOLVE animates A*, arrow keys move the player after building). Note: BUILD may require clicking RESET first when a solved path is currently displayed.
