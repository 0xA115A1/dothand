import { SetStoreFunction } from "solid-js/store";
import Button from "../_ui/atoms/Button.jsx";
import Dropdown from "../_ui/atoms/Dropdown.jsx";
import { FontData } from "../../logic/font/FontModel.js";
import FontName from "./FontName.jsx";
import classes from "./settings.module.css";
import { FontController } from "../../logic/font/FontController.js";

export type IOSettingsProps = {
    fontController: FontController,
    currentFont: FontData,
    setCurrentFont: SetStoreFunction<FontData>,
};

/* TODO: Support for choosing a font format
out of supported by opentype.js with a dropdown */
function DownloadButton(props: Pick<IOSettingsProps, 'fontController'>) {

    return <Button
        theme="settings"
        onClick={() => {
            props.fontController.download()
        }}
    >Download OTF</Button>
}

function ImportForm(props: Pick<IOSettingsProps, 'fontController'>) {
    return <form class={classes.flex} onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        props.fontController.upload(file)
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

    const saveOptions = () =>
        props.fontController.saves.map((slot) => [slot.name, slot.id] as [string, string]);

    return (<article class={classes.settings}>
        <FontName {...props} />
        <h2>Save</h2>
        <div class={classes.flex}>

            <Dropdown
                theme="setting"
                values={saveOptions}
                value={props.fontController.currentSave()}
                onChange={(id) => {
                    props.fontController.setCurrentSave(id);
                    props.fontController.load();
                }}
            />

            <Button
                theme="settings"
                onClick={() => {
                    props.fontController.save()
                }}
                ref={(s) => saveButton = s}
            >Save in browser</Button>
            <Button
                theme="settings"
                disabled={!props.fontController.savesFlag()}
                onClick={() => {
                    props.fontController.load()
                }}
            >Restore browser save</Button>
            <Button
                theme="settings"
                disabled={!props.fontController.savesFlag()}
                onClick={() => {
                    props.fontController.clearSave()
                }}
            >Delete save</Button>
        </div>

        <h2>Export</h2>
        <div class={classes.flex}>
            <Button
                theme="settings"
                onClick={() => {
                    props.fontController.download('pfs')
                }}
            >Download</Button>
            <DownloadButton fontController={props.fontController} />
        </div>
        <h2>Import</h2>
        <div class={classes.flex}>
            <ImportForm fontController={props.fontController} />
        </div>
        <h3>Here be dragons!</h3>
        <div class={classes.flex}>
        <Button
            theme="settings"
            onClick={() => {
                props.fontController.newFont()
            }}
        >New Font</Button>
        {/* <Button
            theme="settings"
            onClick={() => {
                props.fontController.cloneFont()
            }}
        >Copy font</Button> */}
        </div>
    </article>);
}
