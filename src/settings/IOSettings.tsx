import { Accessor } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import Button from "../atoms/Button.jsx";
import { FontData } from "../utils/FontData.js";
import { clearSave, loadFont, saveFont, saveStatus } from "../convert/localSave.js";
import UnicodeData, { useUnicodeData } from "../utils/UnicodeData.jsx";
import FontName from "./FontName.jsx";
import classes from "./settings.module.css";
import { downloadTrueType, downloadPFS, upload } from "../convert/fileIO.js";

export type IOSettingsProps = {
    currentFont: FontData,
    setCurrentFont: SetStoreFunction<FontData>,
};

/* TODO: Support for choosing a font format
out of supported by opentype.js with a dropdown */
function DownloadButton(props: Pick<IOSettingsProps, 'currentFont'>) {
    const unicodeData = useUnicodeData();

    return <Button
        theme="settings"
        onClick={() => {
            downloadTrueType(props.currentFont, unicodeData);
        }}
    >Download OTF</Button>
}

function ImportForm(props: Pick<IOSettingsProps, 'setCurrentFont'>) {
    const unicodeData = useUnicodeData();

    return <form class={classes.flex} onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        upload(file)
            .then(font => {
                if (font) props.setCurrentFont(font);
            })
            .catch(err => console.error('Upload failed:', err));
    }}>
        <input type='file' accept='.pfs,.otf' />
        <Button
            theme="settings"
            type="submit"
        >Upload</Button>
    </form>
}

export default function IOSettings(props: IOSettingsProps) {
    let saveButton: HTMLButtonElement;

    return (<article class={classes.settings}>
        <FontName {...props} />
        <h2>Save</h2>
        <div class={classes.flex}>
            <Button
                theme="settings"
                onClick={() => {
                    saveFont(props.currentFont);
                }}
                ref={(s) => saveButton = s}
            >Save in browser</Button>
            <Button
                theme="settings"
                disabled={() => !saveStatus()}
                onClick={() => {
                    const font = loadFont();
                    if (font) {
                        props.setCurrentFont(font);
                    }
                }}
            >Restore browser save</Button>
            <Button
                theme="settings"
                disabled={() => !saveStatus()}
                onClick={() => {
                    clearSave();
                    saveButton.focus();
                }}
            >Empty browser save</Button>
        </div>

        <h2>Export</h2>
        <div class={classes.flex}>
            <Button
                theme="settings"
                onClick={() => {
                    downloadPFS(props.currentFont);
                }}
            >Download</Button>
            <UnicodeData fallback={<i class={classes.info}>Loading unicode data...</i>}>
                <DownloadButton currentFont={props.currentFont} />
            </UnicodeData>
        </div>
        <h2>Import</h2>
        <div class={classes.flex}>
            <ImportForm setCurrentFont={props.setCurrentFont} />
        </div>
    </article>);
}
