# Dothand — pixel font editor

Online tool for creation and TrueType export of pixel fonts.
[You can check it out here!](https://pages.0xa115a1.com/dothand)
![Current state of affairs](public/dothand256.png)

## Inspiration!
This is a maintained fork of [Shad Amethyst's](https://github.com/adri326) [Online Pixel Font Creator](https://adri326.github.io/online-pixel-font-creator/index.html), which still stays one of the best tools for the use-case, and as far as I know, the only one with both TrueType font export and web-interface. 
While I quite enjoy working in it, I find it lacking some functionality. And, more importantly, though it's still online, lately it's having problems with font exports, due to, well, Time.,,
Therefore to fix a great tool, and maybe make it a bit better, I'm doing this.

## Progress?
As a base for development I used the author's unfinished SolidJs rewrite of the tool. And while it saved me from rewriting raw js into some framework, it still needed some work to get to a state, comparable to the old version.
Currently I consider this rework to be generally on par with the original, of course somewhere laking old features, but providing new.
Notable additions include:
- Working font export
- Reworked calculations of TrueType dimensions metadata to better reflect the standards, as previous approach sometimes lead to rendering issues and broken exports, and notably lead to most extremely wide fonts be considered incorrect.
- A set of glyph-wise operations for centering, mirroring, and bit-invert. (And font-wize centering for monospace font making)
- Glyph move tool (which sadly for now doubles as a replacement for select tool)
- Support of several named saves in browser's localStorage.
- And well, a bunch of refactoring and UI fixes, but that's not a feature.

![Current state of affairs](examples/new_screenshot.png)


## TODO
### Old-features revival:
- [ ] Selection 
- [ ] Text preview
- [ ] Edit history
- [ ] More dimensional helpers
### Planned new features:
- [ ] Add TTF and WOFF export 
- [ ] More tools: brushes / rectangles for drawing / selection.
- [ ] Prettifying the UI generally,
- [ ] Add more inputs for missing font metadata. 
- [ ] Better glyph navigation, e.g. by Unicode block.
- [ ] Autosave
- [ ] More hotkeys, and probably common hot-key schemes support.