export type MoveDirection = "up" | "down" | "left" | "right" | "up-right" | "up-left" | "down-right" | "down-left" | "center";
export const moveDirectionMap: Record<MoveDirection, [number, number]> = {
    "up": [0, -1],
    "down": [0, 1],
    "left": [-1, 0],
    "right": [1, 0],
    "up-right": [1, -1],
    "up-left": [-1, -1],
    "down-right": [1, 1],
    "down-left": [-1, 1],
    "center": [0, 0]
};