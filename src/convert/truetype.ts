import { Path, Glyph as OTGlyph, Font as OTFont, Font } from "opentype.js";
import { FontData, Glyph } from "../utils/FontData.js";
import UnicodeData from "../utils/UnicodeData.jsx";

/* Patch of opentype.js Font interface 
as in https://github.com/opentypejs/opentype.js/discussions/620
otf is capable of storing custom metadata in meta(s) table
while it's not reflected in the corresponding library interfaces
it is still able to properly input and output it,
which is quite useful for our use-case*/
declare module "opentype.js" {
    interface Font {
        metas?: Record<string, string>;
    }
}

/* Per https://learn.microsoft.com/en-us/typography/opentype/spec/head
   A value from 16 to 16384. For TrueType power's of two are recommended.
   This is the basic Em Size of Fonts in units, 2048 is fairly standard
   and fit for our goals, as someone making fonts with bigger dimensions
   (which will lead to impossible pixel scaling in units)
   is quite unlikely.
*/
export const UNITS_PER_EM = 2048; 

// Note: glyphs are wound in the clockwise order for positive areas,
// and counter-clockwise order for negative areas (ie. holes)
export const Direction = Object.freeze({
    RIGHT: 0,
    TOP: 1,
    LEFT: 2,
    BOTTOM: 3
});

const directionMap: Record<Direction, [number, number]> = {
    0: [1, 0],
    1: [0, -1],
    2: [-1, 0],
    3: [0, 1],
};

export type Direction = typeof Direction[keyof typeof Direction];

function generatePath(
    /* here goes the copy of glyph pixels flat array */
    region: readonly boolean[],
    /* metadata */
    glyph: Required<Pick<Glyph, 'width' | 'height' | 'baseline' | 'leftOffset'>>,
    /* Pixel In Units for proper display */
    pixelUnits: number,
    /* OTF path of the glyph */
    path: Path /* We're mutating this!! */
) {
    /* TODO: Rewrite to use some dictionary-like object
    purely for code readability */
    const corners: [
        x: number,
        y: number,
        directionIn: Direction,
        directionOut: Direction,
        currentLoop?: number
    ][] = [];

    function getPixel(x: number, y: number) {
        if (x >= 0 && x < glyph.width && y >= 0 && y < glyph.height) {
            return region[x + y * glyph.width];
        } else return false;
    }

    // Sweep with a 2x2 window, finding corners
    for (let x = 0; x <= glyph.width + 1; x++) {
        for (let y = 0; y <= glyph.height + 1; y++) {
            const topLeft = getPixel(x - 1, y - 1);
            const topRight = getPixel(x, y - 1);
            const bottomLeft = getPixel(x - 1, y);
            const bottomRight = getPixel(x, y);

            const sum = Number(topLeft) + Number(topRight) + Number(bottomLeft) + Number(bottomRight);
            if (sum === 1 || sum === 3) {
                // If three or one neighbors are filled in, then mark a corner:
                // . .
                // →+   dirIN = 0 / RIGHT
                // x↓.  dirOut = 3 / DOWN
                //
                // x x
                // ←+   dirIn = 1 / TOP
                // .↑x  dirOut =  2 / LEFT      

                const directionIn = [
                    bottomLeft && !topLeft,
                    bottomRight && !bottomLeft,
                    topRight && !bottomRight,
                    topLeft && !topRight
                ].indexOf(true) as Direction;

                const directionOut = [
                    bottomRight && !topRight,
                    topRight && !topLeft,
                    topLeft && !bottomLeft,
                    bottomLeft && !bottomRight
                ].indexOf(true) as Direction;

                corners.push([x, y, directionIn, directionOut]);
            } else if (topLeft === bottomRight && topRight === bottomLeft && topLeft !== topRight) {
                // Otherwise, if two tiles are in a diagonal to each other, then mark two corners:
                /* This definitely leads to self-intersecting paths,
                which is not a problem per se, thought some tools
                dislike that.
                This could maybe be fixed by offsetting the corners
                into the figure, by direction in, and opposite of direction out 
                by a small enough value, compared to the pixelUnits.*/
                if (topLeft) {
                    // x .
                    //  +→
                    // .↑x
                    corners.push([x, y, Direction.BOTTOM, Direction.LEFT]);
                    // x↓.
                    // ←+
                    // . x
                    corners.push([x, y, Direction.TOP, Direction.RIGHT]);
                } else {
                    // .↑x
                    //  +←
                    // x .
                    corners.push([x, y, Direction.LEFT, Direction.TOP]);
                    // . x
                    // →+
                    // x↓.
                    corners.push([x, y, Direction.RIGHT, Direction.BOTTOM]);
                }
            }
        }
    }

    if (!corners.length) return;

    function getDirection(direction: Direction): [dx: number, dy: number] {
        return directionMap[direction]
    }

    /* Glyph outline loops, we're mutating this!! */
    let loops: number[][] = [];

    function exploreLoop(n: number, loop: number): void {
        let loopComplete = false;
        /* so...while loops is incomplete
        meaning until we find a neighbor corner
        which we already processed */
        while (!loopComplete) {
            /* ged directionOut,
            coordinates of current corner
            and corresponding coords delta,
            which is calculated based on the
            aforementioned direction */
            let direction: Direction = corners[n][3];//DirOut
            let [dx, dy] = getDirection(direction);
            let x = corners[n][0];
            let y = corners[n][1];
            /* we go down the corner until we find another corner
            if it's unexplored we add it to the loop, 
            change the n to it's index, mark it as explored
            by adding the loop index to it's current loop
            and continue down the directionOut from the found corner
            if we find an explored corner, we end the loop*/
            while (x >= 0 && x <= glyph.width + 1 && y >= 0 && y <= glyph.height + 1) {
                x += dx;
                y += dy;

                const neighbor = corners.find(
                    (c) => c[0] === x && c[1] === y && c[2] === direction
                );
                if (neighbor) {
                    if (neighbor[4] !== undefined) {
                        loopComplete = true;
                        break;
                    }

                    n = corners.indexOf(neighbor);
                    neighbor[4] = loop;
                    loops[loop].push(n);
                    break;
                }
            }
        }
    }
    /* Explore all unexplored loops */
    for (let n = 0; n < corners.length; n++) {
        if (corners[n][4] === undefined) {
            corners[n][4] = loops.length;
            loops.push([n]);
            exploreLoop(n, corners[n][4]!);
        }
    }

    function getOTFCoordinates(x: number, y: number): [x: number, y: number] {
        return [pixelUnits * (x - glyph.leftOffset), pixelUnits * -(y - glyph.baseline)];
    }
    /* go over all loops
    and turn them into paths by making a bunch of lines
    between corners of the same loop
    and then closing it */
    for (let loop of loops) {
        /* If we have anything, which has less 
        corners then a square we probably got 
        a terrible problem in path loop exploration*/
        if (loop.length < 4) {
            throw Error("One of the loops is not even a square, so something terrible went on")
        }
        path.moveTo(...getOTFCoordinates(corners[loop[0]][0], corners[loop[0]][1]));
        for (let n = 1; n < loop.length; n++) {
            path.lineTo(...getOTFCoordinates(corners[loop[n]][0], corners[loop[n]][1]));
        }
        path.close();
    }
}

export function toTruetype(fontData: FontData, unicodeData: Map<number, string>): OTFont {

    let emPixels = Math.max(fontData.width, fontData.height)
    let pixelUnits = Math.round(UNITS_PER_EM/emPixels)

    /* Ok we create a .notdef glyph, not sure why */
    let notdef_glyph = new OTGlyph({
        name: ".notdef",
        unicode: 0,
        advanceWidth: pixelUnits * (fontData.width + fontData.spacing),
        path: new Path()
    });

    let glyphs = [notdef_glyph];

    for (let [id, glyph] of fontData.glyphs) {
        let name = unicodeData.get(id);/* TODO: check the names, FontForge doesn't like them fsr. */
        let path = new Path();
        let is_empty = true;
        let xMin = glyph.width;
        let xMax = 0;
        let yMin = glyph.height;
        let yMax = 0;
        const leftOffset = glyph.leftOffset ?? fontData.leftOffset;

        /* Getting the boundaries in pixels */
        for (let x = 0; x < glyph.width; x++) {
            for (let y = 0; y < glyph.height; y++) {
                if (glyph.get(x, y)) {
                    is_empty = false;
                    xMin = Math.min(xMin, x);
                    xMax = Math.max(xMax, x);
                    yMin = Math.min(yMin, y);
                    yMax = Math.max(yMax, y);
                }
            }
        }
        /* generating path from pixels and dimensions */
        generatePath(
            glyph.getPixels(),
            {
                width: glyph.width,
                height: glyph.height,
                baseline: glyph.baseline ?? fontData.baseline,
                leftOffset
            },
            pixelUnits,
            path
        );

        /* Get actual bounding box */


        /* If we have an actual non-empty glyph or a space (which is notably empty)
        construct OTFGlyph, based on the path  */
        if (!is_empty || id === 32) {
            glyphs.push(new OTGlyph({
                name,
                unicode: id,
                advanceWidth: Math.max(pixelUnits, pixelUnits * (glyph.width + fontData.spacing - leftOffset)),
                path,
                leftSideBearing:  (xMin - leftOffset) * pixelUnits,
                xMin:  (xMin - leftOffset) * pixelUnits,
                xMax:  (xMax - leftOffset) * pixelUnits,
                yMin:  -(yMax - (glyph.baseline ?? fontData.baseline)) * pixelUnits,
                yMax:  -(yMin - (glyph.baseline ?? fontData.baseline)) * pixelUnits,
            }));
        }
    }

    /* Creating and saving metadata to
    'metas' metadata table, as far as I understand
    metadata field name should be capitals 
    and have a string inside */
    let metadata = {
        name: fontData.name,
        author: fontData.author,
        style: fontData.style,
        descend: fontData.descend,
        ascend: fontData.ascend,
        width: fontData.width,
        height: fontData.height,
        baseline: fontData.baseline,
        spacing: fontData.spacing,
        leftOffset: fontData.leftOffset,
    }

    let emSquare = Math.max(fontData.height, fontData.width)

    let newFont = new OTFont({
        familyName: fontData.name,
        styleName: fontData.style || "Medium",
        unitsPerEm: UNITS_PER_EM,
        ascender: pixelUnits * fontData.ascend,
        descender: pixelUnits * fontData.descend,
        glyphs,
    });

    newFont.metas = newFont.metas || {};
    newFont.metas.OPFC = JSON.stringify(metadata);

    console.log(newFont.metas.OPFC);
    return newFont;
}


export function fromTruetype(font: OTFont) {
    if (!font.supported) {
        throw new Error("Font is not supported!");
    }

    if (!font.metas || !font.metas.OPFC) {
        throw new Error("Font is missing OPFC metadata!");
    }

    let metadata = JSON.parse(font.metas.OPFC);


    let name = metadata.name;
    let author = metadata.author;
    let style = metadata.style;

    let width = parseInt(metadata.width);
    let height = parseInt(metadata.height);
    let baseline = parseInt(metadata.baseline);
    let leftOffset = parseInt(metadata.leftOffset);

    let spacing = parseInt(metadata.spacing);
    let ascend = parseInt(metadata.ascend);
    let descend = parseInt(metadata.descend);

    let emPixels = Math.max(width,height)


    console.log(font.metas.OPFC);

    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Failed to get canvas context");
    }
    let glyphs = new Map();

    for (let index = 0; index < font.glyphs.length; index++) {
        let glyph = font.glyphs.get(index);
        let id = glyph.unicode;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "black";
        glyph.draw(ctx, leftOffset, baseline, emPixels);

        let data = ctx.getImageData(0, 0, width, height).data;
        let table = new Glyph(width, height, baseline, leftOffset);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                table.set(x, y, data[(x + y * width) * 4 + 3] > 128); // Read from alpha channel
            }
        }

        glyphs.set(id, table);
    }

    return {
        name: name || "",
        author: author || "",
        style: style || "",

        width,
        height,
        baseline,
        leftOffset,

        ascend: ascend,
        descend: descend,
        spacing,

        glyphs,
        history: [],
    };
}