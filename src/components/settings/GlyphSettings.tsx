import { Accessor, createSignal, For } from "solid-js";
import Button from "../_ui/atoms/Button.jsx";
import Dropdown from "../_ui/atoms/Dropdown.jsx";
import Setting from "../_ui/molecules/Setting.jsx";
import { parseGlyphOrIndex } from "../../common/utils/UTFparse.js";
import { Corner, FontData, Glyph } from "../../logic/font/FontModel.js";
import classes from "./settings.module.css";
import { MoveDirection, moveDirectionMap} from "../../types/common.js";

export type GlyphSettingsProps = {
    currentGlyph: Accessor<Glyph>,
    currentFont: FontData,
    setCurrentGlyph: (glyph: Glyph) => void,
};

// TODO: have a preview of the new coordinates
// TODO: add buttons for resetting glyph



export default function GlyphSettings(props: GlyphSettingsProps) {
    const [temporaryWidth, setTemporaryWidth] = createSignal(props.currentGlyph().width);
    const [temporaryHeight, setTemporaryHeight] = createSignal(props.currentGlyph().height);
    const [corner, setCorner] = createSignal<Corner>(Corner.TOP_RIGHT);

    const [pasteGlyph, setPasteGlyph] = createSignal("");
    const directionButtons: Record<MoveDirection, string> = {
        "up-left": "↖",
        "up": "↑",
        "up-right": "↗",
        "left": "←",
        "center": "•",
        "right": "→",
        "down-left": "↙",
        "down": "↓",
        "down-right": "↘",
    };

    return (<article class={classes.settings}>
        <h2>Paste another glyph</h2>
        <div class={classes.flex}>
            <Setting
                type="text"
                prefix="Glyph:"
                size="small"
                placeholder="u+0041 or A"
                description="Which glyph to paste in; can be the glyph itself, or its unicode index in hexadecimal"
                value={pasteGlyph}
                onChange={setPasteGlyph}
            />
            <Button
                theme="settings"
                onClick={() => {
                    const index = parseGlyphOrIndex(pasteGlyph());
                    setPasteGlyph("");

                    if (index !== undefined) {
                        const glyph = props.currentFont.glyphs.get(index);
                        if (glyph) {
                            props.setCurrentGlyph(glyph.clone());
                        }
                    }
                }}
            >Paste</Button>
        </div>

        <h2>Glyph dimensions</h2>
        <div>
            <span>Where to add/remove pixels:</span>
            <Dropdown
                theme="setting"
                values={[
                    ["Top-right", Corner.TOP_RIGHT],
                    ["Top-left", Corner.TOP_LEFT],
                    ["Bottom-right", Corner.BOTTOM_RIGHT],
                    ["Bottom-left", Corner.BOTTOM_LEFT],
                ]}
                onChange={(corner: Corner) => setCorner(corner)}
            />
        </div>
        <div class={classes.flex}>
            <Setting
                type="number"
                prefix="Width:"
                size="tiny"
                value={temporaryWidth}
                description="The global width of glyphs"
                onChange={setTemporaryWidth}
            />
            <Setting
                type="number"
                prefix="Height:"
                size="tiny"
                value={temporaryHeight}
                description="The global height of glyphs"
                onChange={setTemporaryHeight}
            />
        </div>

        <div class={classes.flex}>
            <Button
                theme="settings"
                onClick={() => {
                    const glyph = props.currentGlyph().resize(temporaryWidth(), temporaryHeight(), corner());

                    props.setCurrentGlyph(glyph);
                }}
            >
                Resize glyph
            </Button>

            <Button
                theme="settings"
                onClick={() => {
                    const glyph = props.currentGlyph().resizeToFit(corner(), true, false);

                    props.setCurrentGlyph(glyph);
                }}
            >
                Resize to fit
            </Button>
        </div>


        <h2>Glyph metrics</h2>
        <div class={classes.flex}>
            <Setting
                type="number"
                prefix="Baseline:"
                size="tiny"
                value={props.currentGlyph().baseline}
                placeholder={props.currentFont.baseline}
                description="The baseline of the current glyph"
                onChange={(baseline) => {
                    const glyph = props.currentGlyph().setBaseline(baseline)

                    props.setCurrentGlyph(glyph);
                }}
                min={0}
                max={props.currentGlyph().height}
            />
            <Setting
                type="number"
                prefix="Left offset:"
                size="tiny"
                value={props.currentGlyph().leftOffset}
                placeholder={props.currentFont.leftOffset}
                description="The left offset of the current glyph"
                onChange={(leftOffset) => {
                    const glyph = props.currentGlyph().setLeftOffset(leftOffset)

                    props.setCurrentGlyph(glyph);
                }}
            />
        </div>

        <h2>Operations</h2>
        <div class={classes.flex}>
            <Button
                theme="settings"
                onClick={() => {
                    const glyph = props.currentGlyph().center();

                    props.setCurrentGlyph(glyph);
                }}
            >
                Center
            </Button>
            <Button
                theme="settings"
                onClick={() => {
                    const glyph = props.currentGlyph().mirror();

                    props.setCurrentGlyph(glyph);
                }}
            >
                Mirror
            </Button>

            <Button
                theme="settings"
                onClick={() => {
                    const glyph = props.currentGlyph().invert();

                    props.setCurrentGlyph(glyph);
                }}
            >
                Invert

            </Button>

            <Button
                theme="settings"
                onClick={() => {
                    const glyph = props.currentGlyph().cut();

                    props.setCurrentGlyph(glyph);
                }}
            >
                Cut

            </Button>
        </div>
        <h2>Move glyph</h2>
        <div class={classes.move_grid}>
            {<For each={Object.entries(directionButtons)}>

                {([key, value]) => {
                    let dir = moveDirectionMap[key as MoveDirection];

                    if (key === "center") {
                        return (<Button
                            theme="mover"
                            onClick={() => {
                                const glyph = props.currentGlyph().center(true, true);

                                props.setCurrentGlyph(glyph);
                            }}>

                            {value}
                        </Button>)
                    }

                    return (<Button
                        theme="mover"
                        onClick={() => {
                            const glyph = props.currentGlyph().move(...dir);

                            props.setCurrentGlyph(glyph);
                        }}
                    >
                        {value}
                    </Button>)
                }}
            </For>}
        </div>
    </article>);
}
