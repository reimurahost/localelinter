# LocaleLinter
Simple "linter" for localization files.
Uses the Google Gemini API to check the localization files for grammar issues.

# Usage
`npx localelinter`
## Options
 - -V, --version            output the version number
 - -d, --directory [value]  The directory of the locale files
 - -ft, --filetype [value]  The file type to check (default: json)
 - -y, --yes                Auto confirm configuration.
 - -e, --code               Use this to have the program exit with code  1 when changes are required.
 - -n, --nosave             Disables the save changes prompt.
 - -a, --autosave           Automaticly saves changes (SCARY)
 - -t, --delay [value]      Delay between each API request (default 200-(MS))
 - -k, --key [value]        The API key to use (default: loaded from env.GEMINI_API_KEY)
 - --llmnote [value]        Add context for Gemini.
## Stupid Uses

`--llmnote` can be used for a bunch of stupid things, such as:
 - `npx localelinter --llmnote "rewrite everything to sound like a catgirl wrote it"`
 ```diff
 -     "change.title": "Change Software",
+     "change.title": "Change Softwares",
-     "change.paper.title": "Paper",
+     "change.paper.title": "Paper, it's the best!",
-     "change.paper.description": "Modern server software known for its high performance and plugins.",
+     "change.paper.description": "Modern server softwares known for their high performance and plugins.",
-     "change.spigot.title": "Spigot",
+     "change.spigot.title": "Spigot, it's okay",
-     "change.spigot.description": "Popular server software known for its plugins.",
+     "change.spigot.description": "Popular server softwares known for their plugins.",
-     "change.forge.title": "Forge",
+     "change.forge.title": "Forge, it's a bit old, but it still works",
-     "change.forge.description": "Common mod loader, used for large mods and modpacks.",
+     "change.forge.description": "Common mod loader, used for large mods and modpacks. It's pretty good for old mods",
-     "change.fabric.title": "Fabric",
+     "change.fabric.title": "Fabric, it's the best!",
-     "change.show.snapshots": "Show Snapshots",
+     "change.show.snapshots": "Show the Sneaky Snapshots",
-     "error": "Failed to fetch JARs",
+     "error": "Oopsie daisy! Could not fetch JARs",
```
(we are ***very*** professional)
## Obtaining an API key
You can obtain a free API key from [here](https://aistudio.google.com/app/apikey).
### Using the API key
Option A:
 - You can use the API key as a command line argument: `npx localelinter --key YOUR_API_KEY`
Option B:
 - You can set the API key as an environment variable `export GEMINI_API_KEY=YOUR_API_KEY`
Option C:
 - You can put the API key in a `.env` file, name it `GEMINI_API_KEY` and put it wherever you plan on running the program from.

## Misc
Google and Google Gemini are trademarks of Google LLC. This content is not affiliated with, endorsed by, or sponsored by Google LLC.

### License
```
MIT License

Copyright (c) 2024 JewelEyed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```