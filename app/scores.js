// ═══════════════════════════════════════════════════════════════════════════════
// SCORE FORMAT — the fields of a score.json (here as a reference).
//
// `groups` is how many groups the piece needs (3 → A, B, C). Phones are dealt
// into them in join order (A, B, C, A, B, C…), and re-dealt whenever the
// conductor picks another score.
//
// Two kinds of drift:
//   ratio   inside a group — phone k plays (k − 1)·(ratio − 1) faster than
//           the first phone of its group, so the group spreads into a cloud
//   spread  across groups — group B plays (spread − 1) faster than A, C twice
//           that, and so on, so the groups drift against each other
// Both add up: phone k of group j plays at
//   1 + (k − 1)·(ratio − 1) + (j − 1)·(spread − 1)
//
// Event fields
//   at      when: "m:ss" or seconds from the start
//   groups  which groups: "ABC", ["A","D"], or "all" (default: all)
//   play    start a sound in those groups ('demo/door', 'P01/03'; see SOUNDS below)
//     ratio   drift inside the group (default: the group's last ratio, or 1)
//     fade    fade-in, seconds
//     level   0–1 (default 1)
//     loop    false = play the file once (default: loop); playing it
//             again in the same group restarts it
//     fadeOut (one-shots) fade out over the last seconds of the file
//   stop    fade out a sound, or "all"
//     fade    fade-out, seconds
//   ratio   change drift inside the groups
//     glide   seconds to move to the new value (default: instant)
//     sound   only this sound (default: all playing in the group)
//   spread  change drift across groups (the whole piece; `groups` is ignored)
//     glide   seconds to move to the new value
//   level   change loudness; with fade (and optionally sound)
//
// All fades (fade-in, fade-out, level changes) follow an S-curve: slow at
// both ends, so they start and land without a bump.
//
// `effects` (optional) gives each group a chain of effects that all its
// sounds go through, in order: { A: [ … ], BC: [ … ], all: [ … ] }
//   lowpass, highpass, bandpass   frequency (Hz), q; or frequency: { lfo:
//                                 { rate, min, max } } to sweep the cutoff
//                                 (its setting is then 'id.frequency.rate')
//   reverb   mix (0–1); decay, preDelay (s, set once)
//   delay    time (s), feedback (0–0.95), mix (0–1)
// A setting is named 'id.setting'; the id is the type unless the effect has
// an `id` (needed for two of the same type in one group).
//
// `effectEvents` (optional) change effect settings during the piece. They
// have their own list, apart from `events`, so the sound events stay readable:
//   at      when, as above
//   groups  which groups, as above
//   set     the setting: 'lowpass.frequency'
//   to      the new value
//   glide   seconds to move to the new value (default: instant)
// See the README.
//
// `end` (optional) is when the conductor shows the piece as finished.
// `credit` (optional) is shown on the conductor and on every phone while the
// score is selected (PTC scores use `credit: PTC_CREDIT`).
// ═══════════════════════════════════════════════════════════════════════════════

// No built-in scores: every piece, the examples included, is a folder in
// ../groups/ (score.json + audio/), listed in ../groups/index.json. The
// examples are in ../groups/00-examples/.
const SOUND_DIR = '../groups/';
const SCORES = [];
