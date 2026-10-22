# Engineering & Curiosity

The portfolio on branch `new` uses a contemporary Roman architectural direction: warm paper, travertine, oxblood, fine construction lines, generous space, and an arch as its recurring shape. Roman numerals mark chapters; project titles and interactions remain plain and accessible.

## References

- [Getty Villa architecture](https://www.getty.edu/visit/villa/top-things-to-do/architecture/) — proportions, thresholds, columns, and natural material.
- [Pentagram: The Joslyn](https://www.pentagram.com/work/the-joslyn) — an editorial relationship between historical and contemporary typography.
- [Cormorant](https://github.com/CatharsisFonts/Cormorant) — display typography.
- [Instrument Sans](https://github.com/Instrument/instrument-sans) — interface and reading typography.

Fonts are hosted locally. Their licenses are in `assets/fonts/`. Project diagrams are illustrative vector studies based on the existing portfolio projects, not screenshots or live telemetry.

## Artwork

`assets/images/roman-arch.jpg` was generated with the built-in ImageGen tool, then encoded as an optimized JPEG. The original generation remains in the Codex generated-images directory.

Final generation prompt:

> Use case: stylized-concept. Asset type: hero artwork for a sophisticated Roman-inspired engineer's personal portfolio, vertical 4:5 composition. A quiet, monumental Roman archway opening onto a sunlit ancient forum at late afternoon. Large warm travertine pillars and one curved arch frame the view; a few elegant distant colonnades with cypress trees recede into dusty haze. Make this feel like a premium architectural editorial photograph rather than a fantasy illustration. Photorealistic architectural art photograph, tactile aged limestone, beautiful natural surface imperfections, fine film grain, soft atmospheric depth. Strong simple forms, architecturally plausible classical Roman details. Vertical portrait composition, very clean confident geometry, foreground arch occupying the left upper and outer frame, deeper ochre shadow inside the arch, warm luminous forum through the opening in the lower middle, soft pale parchment sky above; balanced and uncluttered, one striking arch silhouette. The image will sit in an arch-shaped website frame on the right side of the hero. Golden evening sidelight, contemplative, cultured, quietly ambitious, restrained contrast. Warm ivory limestone, muted clay, aged bronze, deep oxblood shadows, dusty olive foliage, pale champagne sky. No text, letters, inscriptions, graphic overlays, logos, watermarks, people, statues, weapons, banners, or fantasy architecture. Background architecture only.

## Local preview

Serve the repository root with `python3 -m http.server 4173 --bind 127.0.0.1`, then visit `http://127.0.0.1:4173/`. No build step or third-party JavaScript runtime is needed. The root `index.html` is the current site; the pre-existing `dist/` directory is a historical artifact and was not regenerated for this change.

Native project dialogs support Escape, keyboard focus, backdrop dismissal, and focus restoration. Navigation adapts to small screens; reduced-motion preferences are respected. Source content stays visible without animation support.
