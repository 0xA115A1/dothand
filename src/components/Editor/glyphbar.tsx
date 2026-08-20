import { FontData } from "../../logic/font/FontModel.js";
import { Accessor, createMemo, Setter } from "solid-js";
import Button from "../_ui/atoms/Button.jsx";
import { onMount, createEffect, For } from "solid-js";
import { createStore } from "solid-js/store";
import classes from "./style.module.css";
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
} from "../../common/const/colors.js";

const COLOR_CURRENT = COLOR_ALT_LIGHT;
const COLOR_NEIGHBORS = COLOR_PRIMARY_LIGHT;
const COLOR_NEIGHBORS_TEXT = COLOR_GRAY_DARK;

export type GlyphbarProps = {
    fontData: FontData,
    currentGlyphIndex: Accessor<number>,
    setCurrentGlyphIndex: Setter<number>,
}

export default function drawNeighboringGlyphs(
    props: GlyphbarProps
) {

    let nGlyphs = 0x20;
    let halfN = nGlyphs / 2;

    const glyphIndexes = createMemo(() => {
        const current = props.currentGlyphIndex();
        const start = Math.max(current - halfN, 0);
        const end = start + nGlyphs;

        const indexes: number[] = [];
        for (let i = start; i < end; i++) {
            indexes.push(i);
        }
        return indexes;
    });

    function GlyphCanvas(props: {
        fontData: FontData;
        glyphIndex: number;
        selected: boolean;
    }) {
        let canvasRef: HTMLCanvasElement | undefined;

        const pixelSize = Math.ceil(Math.max(window.devicePixelRatio * 1.2, 2));

        const draw = () => {
            const canvas = canvasRef;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.imageSmoothingEnabled = false

            

            const { fontData, glyphIndex, selected } = props;
            const width = (fontData.width + 2) * pixelSize;
            const height = (fontData.height + 2) * pixelSize;

            /*clear whatever is there for redrawing*/
            ctx.clearRect(0, 0, width, height);

            const glyph = fontData.glyphs.get(glyphIndex);
            if (glyph) {

                ctx.fillStyle = selected ? COLOR_CURRENT : COLOR_NEIGHBORS;
                const x = pixelSize;
                const y = pixelSize + fontData.baseline - (glyph.baseline ?? fontData.baseline);

                for (let dy = 0; dy < glyph.height; dy++) {
                    for (let dx = 0; dx < glyph.width; dx++) {
                        if (!glyph.get(dx, dy)) continue;
                        ctx.fillRect(x + dx * pixelSize, y + dy * pixelSize, pixelSize, pixelSize);
                    }
                }
            } else {
                ctx.fillStyle = COLOR_NEIGHBORS_TEXT;
                ctx.font = `${fontData.height * pixelSize * 0.75}px monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(String.fromCodePoint(glyphIndex), width / 2, height / 2);
            }
        };

        onMount(draw);
        createEffect(draw);

        return (
            <canvas
                ref={canvasRef}
                width={(props.fontData.width + 2) * pixelSize}
                height={(props.fontData.height + 2) * pixelSize}
                class ={classes.glyph_canvas}
            />
        );
    }

    return (
        <div class={classes.glyphbar}>
            <For each={glyphIndexes()}>
                {(glyphIndex) => {
                    const glyph = props.fontData.glyphs.get(glyphIndex);

                    return (
                        <Button
                            data-index={glyphIndex}
                            selected={props.currentGlyphIndex() === glyphIndex}
                            onClick={() => props.setCurrentGlyphIndex(glyphIndex)}
                            theme = 'glyphbar'
                        >
                            <GlyphCanvas
                                fontData={props.fontData}
                                glyphIndex={glyphIndex}
                                selected={props.currentGlyphIndex() === glyphIndex}
                            />
                        </Button>
                    );
                }}
            </For>
        </div>
    );
}