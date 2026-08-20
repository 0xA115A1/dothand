import { FontData} from "./FontModel.js";
import opentype from "opentype.js";
import { deserializeFont, serializeFont } from "./convert/serialize.js";
import { fromTruetype, toTruetype } from "./convert/truetype.js"

export type TTTypes = 'otf' | 'ttf' | 'woff'

/* Helper function, just downloads the file with set type and name */
export function download(data: string | ArrayBuffer | any, type: string, name: string) {
    const url = window.URL.createObjectURL(new Blob([data], { type: type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
}

export function downloadPFS(data: FontData): void {
    let fd = serializeFont(data);
    let type = "text/plain";
    let name = `${data.name.replace(/[^a-zA-Z0-9]/g, "")}-${data.style.replace(/[^a-zA-Z0-9]/g, "")}.pfs`;
    download(fd, type, name)
}

export function downloadTrueType(data: FontData, unicodeData:Map<number, string>, ext:TTTypes = 'otf'): void {
    let fd = toTruetype(data, unicodeData).toArrayBuffer()
    let type = "font/opentype";
    let name = `${data.name.replace(/[^a-zA-Z0-9]/g, "")}-${data.style.replace(/[^a-zA-Z0-9]/g, "")}.${ext}`;
    download(fd, type, name)
}

export async function upload(file: File) {

    function uploadPFS(file: File): Promise<FontData> {
        return new Promise<FontData>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(deserializeFont(reader.result as string));
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    function uploadTrueType(file: File): Promise<FontData> {
        return new Promise<FontData>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(fromTruetype(opentype.parse(reader.result)));
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    if (!file) {
        throw new Error("No file provided");
    }

    let ext = file.name.split('.').pop();

    if (!ext) {
        throw new Error("File lacks an extension");
    }

    let fileExtension = ext.toLowerCase();
    console.log(`Uploading file: ${file.name} with extension: ${fileExtension}`);
    switch (fileExtension) {
        case "pfs":
            return await uploadPFS(file);
        case "otf":/* 
        case "ttf": */
            return await uploadTrueType(file);
        default:
            console.error("Unsupported file type");
    }
}