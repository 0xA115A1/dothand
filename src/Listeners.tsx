import { Accessor, onCleanup, Setter } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { FontData, Glyph } from "./logic/font/FontModel.js";
import { FontController } from "./logic/font/FontController.js";
import { useTool } from "./context/Tool.jsx";
import { useOperation } from "./context/Operation.jsx";
import { moveDirectionMap } from "./types/common.js";

export type ListenersProps = {
    fontController: FontController,
    setFontData: SetStoreFunction<FontData>,
    currentGlyphIndex: Accessor<number>,
    setCurrentGlyphIndex: Setter<number>,
    currentGlyph: Accessor<Glyph>;
    setCurrentGlyph: (glyph: Glyph) => void,
}

export default function Listeners(props: ListenersProps) {
    const [tool, setTool] = useTool();
    const [operation, setOperation] = useOperation();
    function onKeyDown(event: KeyboardEvent) {
        console.log(event.code, event.ctrlKey, event.shiftKey);
        if (event.code === "KeyS" && event.ctrlKey && !event.shiftKey) {
            event.preventDefault();
            props.fontController.save()
        } else if ((event.code === "ArrowLeft" || event.code === "ArrowRight") && !event.ctrlKey) {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            const offset = event.code === "ArrowLeft" ? -1 : 1;
            let newGlyphIndex = props.currentGlyphIndex() + offset;
            if (newGlyphIndex < 0) newGlyphIndex = 0;
            props.setCurrentGlyphIndex(newGlyphIndex);
        }

        else if (event.code === "KeyF") setOperation(0);
        else if (event.code === "KeyB") setOperation(1);
        else if (event.code === "KeyE") setOperation(2);

        else if (event.code === "KeyD") setTool(0)
        else if (event.code === "KeyV") setTool(1)

        else if (event.code === "KeyC") {
            let glyph = props.currentGlyph();
            if (event.shiftKey) {
                glyph = glyph.center(false, true);
            } else {
                glyph = glyph.center(true, false);
            }


            props.setCurrentGlyph(glyph);
        }

        else if (event.code === "KeyM") {
            
            const glyph = props.currentGlyph().mirror();

            props.setCurrentGlyph(glyph);
        }

        else if (event.code === "Numpad5") {
            const glyph = props.currentGlyph().center(true, true);

            props.setCurrentGlyph(glyph);
        }

        else if (event.code === "Numpad8") {
            const glyph = props.currentGlyph().move(...moveDirectionMap['up']);
            props.setCurrentGlyph(glyph);
        }
        else if (event.code === "Numpad2") {
            const glyph = props.currentGlyph().move(...moveDirectionMap['down']);
            props.setCurrentGlyph(glyph);
        }

        else if (event.code === "Numpad4") {
            const glyph = props.currentGlyph().move(...moveDirectionMap['left']);
            props.setCurrentGlyph(glyph);
        }
        else if (event.code === "Numpad6") {
            const glyph = props.currentGlyph().move(...moveDirectionMap['right']);
            props.setCurrentGlyph(glyph);
        }

        else if (event.code === "Numpad7") {
            const glyph = props.currentGlyph().move(...moveDirectionMap['up-left']);
            props.setCurrentGlyph(glyph);
        }
        else if (event.code === "Numpad9") {
            const glyph = props.currentGlyph().move(...moveDirectionMap['up-right']);
            props.setCurrentGlyph(glyph);
        }

        else if (event.code === "Numpad1") {
            const glyph = props.currentGlyph().move(...moveDirectionMap['down-left']);
            props.setCurrentGlyph(glyph);
        }
        else if (event.code === "Numpad3") {
            const glyph = props.currentGlyph().move(...moveDirectionMap['down-right']);
            props.setCurrentGlyph(glyph);
        }
    }

    window.addEventListener("keydown", onKeyDown);
    onCleanup(() => {
        window.removeEventListener("keydown", onKeyDown);
    });

    return null;
}
