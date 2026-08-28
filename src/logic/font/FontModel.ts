export const Corner = Object.freeze({
    TOP_LEFT: 0,
    TOP_RIGHT: 1,
    BOTTOM_LEFT: 2,
    BOTTOM_RIGHT: 3,
});
export type Corner = 0 | 1 | 2 | 3;

// TODO: move to a different file
export class Glyph {
    private pixels: boolean[];

    constructor(
        public readonly width: number,
        public readonly height: number,
        public readonly baseline?: number,
        public readonly leftOffset?: number,
        pixels = new Array(width * height).fill(false),
    ) {
        if (pixels.length != width * height) {
            throw new Error("Assertion error: expected pixels.length to be equal to width * height");
        }
        this.pixels = pixels;
    }

    dimensions(): [width: number, height: number] {
        return [this.width, this.height];
    }

    get(x: number, y: number) {
        if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.pixels[x + y * this.width];
    }

    /** Sets the pixel at `x, y` to `value`.
     *
     * __mutates `this`!__
     **/
    set(x: number, y: number, value: boolean) {
        if (!Number.isInteger(x) || !Number.isInteger(y)) return;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.pixels[x + y * this.width] = value;
    }

    getPixels(): boolean[] {
        return this.pixels;
    }

    setBaseline(baseline: number): Glyph {
        return new Glyph(this.width, this.height, baseline, this.leftOffset, this.pixels);
    }

    setLeftOffset(leftOffset: number): Glyph {
        return new Glyph(this.width, this.height, this.baseline, leftOffset, this.pixels);
    }

    /**
     * Returns a deep copy of this glyph, allowing for mutation of the glyph.
     **/
    clone(): Glyph {
        return new Glyph(this.width, this.height, this.baseline, this.leftOffset, this.pixels.slice());
    }

    resize(width: number, height: number, corner: Corner): Glyph {
        const result = new Glyph(width, height, this.baseline, this.leftOffset);
        const isTopCorner = corner === Corner.TOP_LEFT || corner === Corner.TOP_RIGHT;

        const left = corner === Corner.TOP_LEFT || corner === Corner.BOTTOM_LEFT ? width - this.width : 0;
        const top = isTopCorner ? height - this.height : 0;

        for (let y = 0; y < this.height; y++) {
            if (y + top < 0 || y + top >= height) continue;
            for (let x = 0; x < this.width; x++) {
                result.set(x + left, y + top, this.pixels[x + y * this.width]);
            }
        }

        return result;
    }

    resizeToFit(corner: Corner, horizontal: boolean, vertical: boolean): Glyph {
        let minX = this.width - 1;
        let maxX = 0;
        let minY = this.height - 1;
        let maxY = 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.get(x, y)) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        const width = corner === Corner.BOTTOM_LEFT || corner === Corner.TOP_LEFT ? this.width - minX + 1 : maxX + 1;
        const height = corner === Corner.TOP_LEFT || corner === Corner.TOP_RIGHT ? this.height - minY + 1 : maxY + 1;

        return this.resize(horizontal ? width : this.width, vertical ? height : this.height, corner);
    }

    cut(byX: boolean = true, byY: boolean = false): Glyph {
        let minX = this.width - 1;
        let maxX = 0;
        let minY = this.height - 1;
        let maxY = 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.get(x, y)) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        const width = maxX - minX+1
        const height = maxY - minY+1
        /* move the whole glyph to bottom-left corner 
        to cut everything from top-right corner */
        return this.move(byX?-minX:0,byY?-minY:0).resize(byX ? width : this.width, byY ? height : this.height, Corner.TOP_RIGHT);
    }
    /* Basic move helper, returns a new glyph
        offset by respective x and y values. */
    move(xOffset: number = 0, yOffset: number = 0): Glyph {
        const result = new Glyph(this.width, this.height, this.baseline, this.leftOffset);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.get(x, y)) {
                    result.set(x + xOffset, y + yOffset, true);
                }
            }
        }
        return result;
    }

    /* Glyph centering along Selected axis
    for making monotype fonts 
    Finds the real width/height from first/last non-empty
    columns or rows.
    Then offsets by half of the real width 
    from the start of the symbol 
    */
    center(byX = true, byY = false): Glyph {

        let offsetX = 0;
        let offsetY = 0;

        let startX = this.width;
        let endX = -1;
        let startY = this.height;
        let endY = -1;

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.get(x, y)) {
                    if (x < startX) { startX = x }
                    if (x > endX) { endX = x }
                    if (y < startY) { startY = y }
                    if (y > endY) { endY = y }
                }
            }
        }

        if (byX) {
            const realWidth = endX - startX;
            offsetX = Math.floor((this.width - realWidth) / 2) - startX;
        }
        if (byY) {
            const realHeight = endY - startY;
            offsetY = Math.floor((this.height - realHeight) / 2) - startY;
        }
        return this.move(offsetX, offsetY);
    }
    /* Simple mirroring  */
    mirror(byX = true, byY = false): Glyph {
        const result = new Glyph(this.width, this.height, this.baseline, this.leftOffset);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let pixel = this.get(x, y)
                let newX = byX ? this.width - x - 1 : x;
                let newY = byY ? this.height - y - 1 : y;
                result.set(newX, newY, pixel)
            }
        }
        return result
    }
    /*Inverts all pixels of the glyph */
    invert(): Glyph {
        const result = new Glyph(this.width, this.height, this.baseline, this.leftOffset);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                result.set(x, y, !this.get(x, y))
            }
        }
        return result
    }
}

export type FontData = {
    glyphs: Map<number, Glyph>;
    descend: number;
    ascend: number;
    width: number;
    height: number;
    baseline: number;
    spacing: number;
    leftOffset: number;

    name: string;
    author: string;
    style: string;
}
