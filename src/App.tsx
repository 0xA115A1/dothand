import { createMemo, createResource, createSignal } from "solid-js";
import classes from "./App.module.css";
import Editor from "./components/Editor/index.jsx";
import Listeners from "./Listeners.jsx";
import Tabbed from "./components/_ui/molecules/Tabbed.jsx";
import FontSettings from "./components/settings/FontSettings.jsx";
import GlyphSettings from "./components/settings/GlyphSettings.jsx";
import IOSettings from "./components/settings/IOSettings.jsx";
import { FontData, Glyph } from "./logic/font/FontModel.js";
import { FontController } from "./logic/font/FontController.js";
import UnicodeData, { useUnicodeData } from "./context/UnicodeData.jsx";

/* I just needed the Providers to be outside of the body
to actually consume the context. */
export default function App() {
    return (
        <UnicodeData fallback={<i class={classes.info}>Loading unicode data...</i>}>
            <Content/>
        </UnicodeData>
    )
}


function Content() {
    const unicodeData = useUnicodeData();
    const fontController = new FontController(unicodeData);
    const currentFont = fontController.fontData
    const setCurrentFont = fontController.setFontData

    const [currentGlyphIndex, setCurrentGlyphIndex] = createSignal(65);

    const currentGlyph = createMemo(() => {
        return fontController.getGlyph(currentGlyphIndex()) ?? new Glyph(currentFont.width, currentFont.height);
    });

    const setCurrentGlyph = (newGlyph: Glyph) => {
        fontController.setGlyph(currentGlyphIndex(), newGlyph)
    };

    return (<div class={classes.App}>
        <Listeners
            fontController={fontController}
            setFontData={setCurrentFont}
            currentGlyphIndex={currentGlyphIndex}
            setCurrentGlyphIndex={setCurrentGlyphIndex}
        />
        <Editor
            fontData={currentFont}
            setFontData={setCurrentFont}
            currentGlyphIndex={currentGlyphIndex}
            setCurrentGlyphIndex={setCurrentGlyphIndex}
        />
        <div class={classes["right-panel"]}>
            <Tabbed>
                {{
                    Font: () => <FontSettings currentFont={currentFont} setCurrentFont={setCurrentFont} />,
                    Glyph: () => <GlyphSettings
                        currentGlyph={currentGlyph}
                        setCurrentGlyph={setCurrentGlyph}
                        currentFont={currentFont}
                    />,
                    "Import/Export": () => <IOSettings
                        fontController={fontController}
                        currentFont={currentFont}
                        setCurrentFont={setCurrentFont}
                    />,
                }}
            </Tabbed>
        </div>
    </div>);
}
