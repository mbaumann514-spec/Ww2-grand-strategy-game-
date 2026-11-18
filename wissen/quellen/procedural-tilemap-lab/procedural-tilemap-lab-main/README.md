# Procedural Tilemap Lab

English | [日本語](README.ja.md)

![Procedural Tilemap Lab](assets/readme/title.jpg)

A browser-based tool for generating reproducible tilemaps for 2D top-down games.
It supports grassland, road, forest, mountain, and dungeon maps.
Designed for game development through vibe coding, it can export the generator's code and data as an AI integration bundle.

## Start

Requires Node.js 22 or later. No `npm install` is needed.

On Windows, double-click:

```text
start-lab-server.bat
```

From the command line or on other operating systems, run:

```powershell
npm start
```

## Features

- Seeded map generation with random, preset, and custom sizes
- Map View for generation, inspection, and debug overlays
- Material Lab for adjusting props and procedural elements
- English and Japanese interfaces
- AI integration bundle and PNG exports

Saving in Material Lab updates JSON files in the local checkout and can generate PNG assets.

## Tests

```powershell
npm test
```

Use `npm run check` for the full validation across many seeds.

## License

Source code and documentation are licensed under the [MIT License](LICENSE).
Image assets are provided under [CC0 1.0 Universal](ASSET-LICENSE.md).
