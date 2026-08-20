
import { FontData, Glyph } from "./FontModel.js";

import { Accessor, Setter } from "solid-js";
import { createStore, SetStoreFunction, unwrap } from "solid-js/store";
import { createLocalStore, createLocalSignal } from "../../common/utils/reactiveLocalStorage.js";

import { deserializeFont, serializeFont } from "./convert/serialize.js";
import { TTTypes, downloadPFS, downloadTrueType, upload } from "./fileIO.js";


type AllTypes = 'pfs' | TTTypes

export type SaveSlot = {
    id: string;
    name: string;
};

export class FontController {

    fontData!: FontData;
    setFontData!: SetStoreFunction<FontData>

    saves: SaveSlot[]
    setSaves: SetStoreFunction<SaveSlot[]>;

    currentSave: Accessor<string>
    setCurrentSave: Setter<string>

    savesFlag: () => boolean;

    unicodeData: Map<number, string>


    constructor(ud: Map<number, string>) {
        this.unicodeData = ud;
        /* Here we just get the saves slots, current save and 
        deserialize the data of the current save. */
        [this.saves, this.setSaves] = createLocalStore<SaveSlot[]>("saves", []);
        this.savesFlag = () => this.saves.length > 0;
        [this.currentSave, this.setCurrentSave] = createLocalSignal<string>("current", '');

        [this.fontData, this.setFontData] = createStore<FontData>(this.getDefaultFont());
        if (this.savesFlag()) {
            if (!this.currentSave()) {
                this.setCurrentSave(this.saves[0].id)
            }
            this.load()
        } else {
            this.newFont()
        }

    }

    getDefaultFont() {
        return {
            width: 8,
            height: 10,
            baseline: 8,
            ascend: 7,
            descend: 0,
            spacing: 1,
            leftOffset: 0,
            glyphs: new Map(),
            // history: [],

            name: "My Amazing Font",
            author: "Anonymous",
            style: "Medium",
        }
    }

    newFont() {
        this.setCurrentSave('')
        this.setFontData(this.getDefaultFont())
    }

    setGlyph(id: number, glyph: Glyph) {
        const newGlyphs = new Map(this.fontData.glyphs);
        newGlyphs.set(id, glyph);
        this.setFontData("glyphs", newGlyphs);
    }

    getGlyph(id: number) {
        return this.fontData.glyphs.get(id)
    }

    setGlyphs(glyphs: Map<number, Glyph>) {
        this.setFontData("glyphs", new Map(glyphs));
    }

    /* Local storage management */
    clearSave() {
        const id = this.currentSave()
        if (!id) return;
        this.setSaves((slots) => slots.filter((s) => s.id != id))
        window.localStorage.removeItem(this.currentSave());
        if (this.saves.length > 0) {
            this.setCurrentSave(this.saves[0].id);
            this.load();
        } else {
            this.newFont();
        }
    }

    getName() {
        return `${this.fontData.name} ${this.fontData.style}`
    }

    save() {
        let id = this.currentSave();
        const isNew = !id;
        if (isNew) id = crypto.randomUUID();

        const name = this.getName()
        window.localStorage.setItem(id, serializeFont(this.fontData));
        if (isNew) this.setSaves((slots) => [...slots, { id: id, name: name }])
        else this.setSaves((slots) => [...slots.filter((s) => s.id != id), { id: id, name: name }])
        this.setCurrentSave(id);
    }

    load() {
        const save = window.localStorage.getItem(this.currentSave());
        if (!save) { throw new Error('Trying to load non-existing save') }

        this.setFontData(deserializeFont(save));
    }

    /*File management  */
    download(type: AllTypes = 'otf') {
        if (type === 'pfs') {
            downloadPFS(this.fontData)
        } else {
            downloadTrueType(this.fontData, this.unicodeData, type)
        }
    }

    upload(file: File) {
        this.setCurrentSave('')
        upload(file)
            .then(data => {
                if (data) this.setFontData(data)
                this.save()
            })
            .catch(err => console.error('Upload failed:', err));
    }

}