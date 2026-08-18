import { FontData } from "../utils/FontData.js";
import { Accessor, Setter } from "solid-js";
import {
    COLOR_PRIMARY_DARK,
    COLOR_PRIMARY_LIGHT,
    COLOR_ALT_DARK,
    COLOR_ALT_LIGHT,
    COLOR_GRAY_LIGHT,
    COLOR_GRAY_MEDIUM,
    COLOR_GRAY_DARK,
    COLOR_BLACK,
    COLOR_WHITE,
    COLOR_LIGHT_BLUE
} from "../common/colors.js";

const COLOR_CURRENT = COLOR_PRIMARY_LIGHT;
const COLOR_NEIGHBORS_BG = COLOR_GRAY_LIGHT;
const COLOR_NEIGHBORS_CURRENT_BG = COLOR_WHITE;
const COLOR_NEIGHBORS = COLOR_PRIMARY_LIGHT;
const COLOR_NEIGHBORS_TEXT = COLOR_GRAY_DARK;

export type GlyphbarProps = {
    fontData: FontData,
    currentGlyphIndex: Accessor<number>,
    setCurrentGlyphIndex: Setter<number>,
}

function drawNeighboringGlyphs(
    props:GlyphbarProps
) {
    const pixelSize = Math.ceil(Math.max(window.devicePixelRatio * 1.5, 2));
    ctx.fillStyle = COLOR_NEIGHBORS_BG;
    ctx.fillRect(
        0,
        canvas.height - (fontData.height + 2) * pixelSize,
        canvas.width,
        (fontData.height + 2) * pixelSize
    );

    let n_chars = Math.floor(canvas.width / (fontData.width + 2) / pixelSize);

    ctx.font = (fontData.height * pixelSize * 0.75) + "px monospace";
    for (let n = 0; n < n_chars; n++) {
        let offset = n - Math.round(n_chars / 2);
        let x = (n * (fontData.width + 2) + 1) * pixelSize;
        let y = canvas.height - (fontData.height + 1) * pixelSize;

        if (offset === 0) {
            ctx.fillStyle = COLOR_NEIGHBORS_CURRENT_BG;
            ctx.fillRect(
                x - pixelSize,
                y - pixelSize,
                (fontData.width + 2) * pixelSize,
                (fontData.height + 2) * pixelSize
            );
        }

        if (currentGlyphIndex + offset < 0 || currentGlyphIndex + offset > 0x1FFFF) continue;

        let currentGlyph = fontData.glyphs.get(currentGlyphIndex + offset);
        let drewPixel = false;
        if (currentGlyph) {
            ctx.fillStyle = COLOR_NEIGHBORS;
            for (let dy = 0; dy < currentGlyph.height; dy++) {
                for (let dx = 0; dx < currentGlyph.width; dx++) {
                    if (!currentGlyph.get(dx, dy)) continue;
                    drewPixel = true;
                    ctx.fillRect(
                        x + dx * pixelSize,
                        y + fontData.baseline - (currentGlyph.baseline ?? fontData.baseline) + dy * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
        if (!currentGlyph || !drewPixel) {
            ctx.fillStyle = COLOR_NEIGHBORS_TEXT;
            ctx.fillText(
                UTF16FromCharCode(currentGlyphIndex + offset),
                x + fontData.width * pixelSize / 2,
                y + fontData.height * pixelSize / 2 + pixelSize
            );
        }
    }

    return(
        <>

        </>
    )
}