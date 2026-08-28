import { untrack } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import Setting from "../_ui/molecules/Setting.jsx";
import { FontData } from "../../logic/font/FontModel.js";
import FontName from "./FontName.jsx";
import classes from "./settings.module.css";
import Button from "../_ui/atoms/Button.jsx";

export type FontSettingsProps = {
    currentFont: FontData,
    setCurrentFont: SetStoreFunction<FontData>
};

// TODO: see if the untracks can be removed
export default function FontSettings(props: FontSettingsProps) {
    const currentFont = props.currentFont;
    const setCurrentFont = props.setCurrentFont;

    function createSetter<Name extends keyof FontData>(name: Name, defaultValue: FontData[Name]) {
        return (value: FontData[Name]) => setCurrentFont(name, value || defaultValue);
    }

    return (<article class={classes.settings}>
        <FontName {...props} />

        <h2>Dimensions</h2>
        <div class={classes.flex}>
            <Setting
                type="number"
                prefix="Width:"
                size="tiny"
                value={props.currentFont.width}
                description="The global width of glyphs"
                onChange={(width) => setCurrentFont("width", width)}
            />
            <Setting
                type="number"
                prefix="Height:"
                size="tiny"
                value={props.currentFont.height}
                description="The global height of glyphs"
                onChange={(height) => setCurrentFont("height", height)}
            />
            {/* <Button
                theme="settings"
                onClick={() => {
                    // TODO: retro-actively resize glyphs and add corner snapping dropdown
                    setCurrentFont("width", temporaryWidth() || props.currentFont.width);
                    setCurrentFont("height", temporaryHeight() || props.currentFont.height);
                }}
            >
                Resize all glyphs
            </Button> */}
        </div>

        <h2>Spacing</h2>
        <div class={classes.flex}>
                
            <h3>Vertical</h3>
            <div class={classes.flex}>
                <Setting
                    type="number"
                    prefix="Baseline:"
                    size="tiny"
                    value={props.currentFont.baseline}
                    description="The global baseline, which is the line on top of which most characters 'sit'. In pixels from the top of the glyph."
                    onChange={createSetter("baseline", 0)}
                    min={0}
                    max={currentFont.height}
                />
                <Setting
                    type="number"
                    prefix="Ascend:"
                    size="tiny"
                    value={props.currentFont.ascend}
                    description="The global ascend, defines how high up capital letters like 'T' will rise. In pixels from the baseline, going up."
                    onChange={createSetter("ascend", 0)}
                    min={0}
                    max={props.currentFont.baseline}
                />
                <Setting
                    type="number"
                    prefix="Descend:"
                    size="tiny"
                    value={props.currentFont.descend}
                    description="The global descend, defines how low letters like 'g' will go below the baseline. In pixels from the baseline, going up (you will thus need a negative value)."
                    onChange={createSetter("descend", 0)}
                    max={0}
                    min={currentFont.baseline - currentFont.height}
                />
            </div>

            <h3>Horizontal</h3>
            <div class={classes.flex}>
                <Setting
                    type="number"
                    prefix="Left offset:"
                    size="tiny"
                    value={untrack(() => props.currentFont.leftOffset)}
                    description="The global left offset, defines where the characters commonly start. Setting it to a higher value will 'shift' the glyphs left, allowing for overlap. In pixels from the left of the glyph."
                    onChange={createSetter("leftOffset", 0)}
                />
                <Setting
                    type="number"
                    prefix="Spacing:"
                    size="tiny"
                    value={untrack(() => props.currentFont.spacing)}
                    description="The global spacing, defines how spaced out characters should be. If set to 0, then the left offset line of the current character will intersect with the 'em' line of the previous character."
                    onChange={createSetter("spacing", 0)}
                />
            </div>
        </div>
        <h2>Mass glyph Action</h2>
        <div class={classes.flex}>
            {/* <Button
                theme="settings"
                onClick={() => {
                    const newGlyphs = new Map();
                    currentFont.glyphs.forEach((glyph, key) => {
                        const centered = glyph.centerSelf(); // mutates, returns same object
                        newGlyphs.set(key, centered.clone()); // or ensure it's a new object
                    });
                    setCurrentFont("glyphs", newGlyphs);
                }}
            >
                Resize to fit
            </Button> */}
            <Button
                theme="settings"
                onClick={() => {
                    const newGlyphs = new Map();
                    currentFont.glyphs.forEach((glyph, key) => {
                        const centered = glyph.center(); // mutates, returns same object
                        newGlyphs.set(key, centered.clone()); // or ensure it's a new object
                    });
                    setCurrentFont("glyphs", newGlyphs);
                }}
            >
                Center
            </Button>

            <Button
                theme="settings"
                onClick={() => {
                    const newGlyphs = new Map();
                    currentFont.glyphs.forEach((glyph, key) => {
                        const cut = glyph.cut(); // mutates, returns same object
                        newGlyphs.set(key, cut.clone()); // or ensure it's a new object
                    });
                    setCurrentFont("glyphs", newGlyphs);
                }}
            >
                Cut
            </Button>
        </div>
    </article>);
}
