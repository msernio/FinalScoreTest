# CART346-FP · It’s Gonna Rain — Final projects

Scores and sounds for the CART 346 Digital Sound final projects: pieces for an ensemble of phones, after Steve Reich’s *It’s Gonna Rain* (1965). One laptop runs the conductor; every phone in the room is one voice.

- **Conductor:** https://concordia-dcart.github.io/CART346-FP/ (every piece is in its Piece menu)

Each group owns **one folder** in `groups/`. That folder is the whole submission: `score.json`, the sounds in `audio/`, and a short README. Nothing else in the repository changes.

```
CART346-FP/
├── index.html            opens the conductor
├── app/                  the ensemble app: conductor, phone page, score editor (don’t edit)
├── scripts/              build-index.mjs: lists and checks the pieces (run by GitHub Actions)
└── groups/
    ├── index.json        list of pieces in the menus (built automatically, don’t edit)
    ├── 00-examples/      three example pieces, each a folder like yours:
    │   ├── crickets/         one sound passed between groups, a filter swept by an LFO
    │   ├── effects-testing/  one sound through four effect chains
    │   └── ptc-01/           six sounds entering one by one, drifting in each group
    ├── _template/        copy this to start
    └── your-group-name/  ← your submission
        ├── score.json    title, group, theme, members, credit, and the score
        ├── README.md     program note, sound list, performance notes
        └── audio/        your sound files, nothing else
```

## Submitting your project

1. **Fork** this repository once per group (one member forks; add your teammates under *Settings → Collaborators* so everyone can push).
2. Turn on **GitHub Pages** in your fork: *Settings → Pages → Deploy from a branch → `main` / root*.
3. **Copy `groups/_template/`** to `groups/<your-group-name>/`. Use lowercase and hyphens, no spaces or accents: `groups/tidal-machines/`.
4. **Write your `score.json`**, starting from the template. Fill in `title`, `group`, `theme`, `members` and `credit`, put your sound files in `audio/` and name them in `sounds`, then write your `events` (see *score.json* below and the examples in `groups/00-examples/`). Any text editor works; one that checks JSON (VS Code, for instance) points out a missing comma or quote before you push.
5. Fill in your folder’s `README.md`.
6. **Test** on your fork’s site, with your folder name in the link:
   `https://<your-username>.github.io/CART346-FP/app/conductor.html?group=<your-group-name>`
   Open it on a laptop, scan the QR code with a few phones, and play your piece. Mistakes (a missing sound, a bad time) show in red under the timeline.
7. **Commit and push** only your group folder. Then open a **pull request** to `concordia-dcart/CART346-FP`, titled with your group name.

Don’t edit `app/`, `groups/00-examples/`, `groups/index.json` or another group’s folder: the pull request should only add files inside `groups/<your-group-name>/`.

The pull request is **checked automatically**: `score.json` must be valid, have `title`, `group`, `theme` and `members`, and every sound it plays must be in the folder (names are case-sensitive), within the size limits below. Problems show on the pull request; push a fix to your fork and the check runs again. Once Gabriel merges it, your piece appears in the conductor’s Piece menu within a couple of minutes.

## score.json

```json
{
  "title": "Low Tide",
  "group": "Tidal Machines",
  "theme": "The sea as a clock",
  "members": ["Ana Pérez", "Sam Lee", "Noor Haddad"],
  "credit": "Recorded at Pointe-du-Moulin by the group.",
  "groups": 3,
  "sounds": { "waves": "audio/waves.mp3", "bell": "audio/buoy-bell.wav" },
  "events": [
    { "at": "0:00", "groups": "AB", "play": "waves", "ratio": 1.002, "fade": 10 },
    { "at": "0:30", "spread": 1.004, "glide": 30 },
    { "at": "1:00", "groups": "C", "play": "bell", "ratio": 1.01, "fade": 20 },
    { "at": "2:40", "stop": "all", "fade": 20 }
  ],
  "end": "3:00"
}
```

`group`, `theme`, `members` and `credit` are shown under the conductor’s timeline and on every phone during your piece. Everything else (events, effects, effect changes) is explained in [app/README.md](app/README.md#the-score-format). The examples in `groups/00-examples/` are folders like yours: read their `score.json` to see how they’re written, and play them in the conductor to hear the result.

## Sound files

- **WAV** for anything that loops: MP3 adds a short silence at the start and end of the file, which you’ll hear at every loop.
- 44.1 kHz, 16-bit; mono is fine (every phone is one speaker).
- Levels: peaks at about **−1 dBFS**, no clipping, and the files of a piece at similar loudness (**-17 dB LUFS**), so the `level` values in your score do the mixing. Phone speakers barely reproduce anything below ~150 Hz: check that low sounds still read on a phone.
- File names: lowercase, hyphens, no spaces (`buoy-bell.wav`).
- Keep each file under **10 MB** and the folder under **50 MB**. Every phone downloads the sounds over the room’s Wi-Fi before the piece starts.
- Only the sounds the piece uses. Rehearsal takes, project files and patches stay out of this repository.
- Credit every sound you didn’t record yourselves in `credit` and in your README.

## For the instructor

- **Adding a group:** just merge its pull request. The *Pages* workflow (`.github/workflows/pages.yml`) runs `scripts/build-index.mjs`, which finds every folder in `groups/` holding a `score.json` (folders starting with `_` are skipped), writes `groups/index.json`, and deploys the site. On pull requests it only checks the pieces, and marks the pull request as failing if something is wrong. Examples (`00-examples/…`) are listed under *Examples*, the rest under *Final projects*, by folder name. The conductor opens on the first example.
- **One-time setup:** *Settings → Pages → Build and deployment → Source: GitHub Actions*. (The site is deployed by the workflow, not straight from the branch.)
- **Testing locally:** `node scripts/build-index.mjs` rebuilds `groups/index.json` (`--check` only checks), then serve the folder (`npx http-server`) and open `app/conductor.html`.
- **One room for the whole concert:** every piece is chosen from the conductor’s Piece menu, so phones scan the QR code once and stay joined between pieces. The conductor remembers its room on that computer: reopening or reloading the page keeps the same code. *new room* (under the QR code) or `app/conductor.html?room=new` starts a fresh one. Run only one conductor tab per room.
- **One group:** `app/conductor.html?group=tidal-machines` opens that group’s piece in the same room, whether or not it’s in the list.
- **A group’s fork, before merging:** paste `https://github.com/<user>/CART346-FP/tree/main/groups/<folder>` into the conductor’s link box and press **Load**.
- **Broker:** add `&broker=wss://…/mqtt` to the conductor link to use another MQTT broker (see [app/README.md](app/README.md)).
- `.nojekyll` must stay: without it, GitHub Pages hides folders whose names start with `_`.

The app is the ensemble from [Phase Study](https://github.com/vigliensoni/phase-study) by Gabriel Vigliensoni (MIT licence, see `app/LICENSE.md`), with extensive contributions by Jessica Chan, Sabrina Chan, Eamon Foley, Victoria Hoang, and Leah Song. Claude has been use to code the app.


The Crickets and PTC 01 examples use sounds generated by the instruments of Productions Totem Contemporain. Each group’s sounds and scores belong to the group.
