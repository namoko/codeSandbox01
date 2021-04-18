import { Vec2 } from "../math/vec2";

export type MazeLayout = CellType[][];
type Pos = [x: number, y: number];
type LevelBlueprint = string[];

/**
 * 0 - empty outside
 * . - empty inside
 * 1 - wall
 * & - player
 * x - box
 * _ - box placeholder
 */

const levels: LevelBlueprint[] = [
  // level 1
  [
    "    11111          ",
    "    1...1          ",
    "    1x..1          ",
    "  111..x11         ",
    "  1..x.x.1         ",
    "111.1.11.1   111111",
    "1...1.11.11111..__1",
    "1.x..x..........__1",
    "11111.111.1&11..__1",
    "    1.....111111111",
    "    1111111        ",
  ],
  // level 2
  [
    "111111111111  ",
    "1__..1.....111",
    "1__..1.x..x..1",
    "1__..1x1111..1",
    "1__....&.11..1",
    "1__..1.1..x.11",
    "111111.11x.x.1",
    "  1..x.x.x.x.1",
    "  1....1.....1",
    "  111111111111",
  ],
];

export enum CellType {
  EmptyOutside,
  EmptyInside,
  Wall,
  BoxPlaceholder,
}

export class Maze {
  public startPoint = new Vec2(1, 1);
  public layout: MazeLayout;
  public boxes: Pos[] = [];

  constructor(level: LevelBlueprint) {
    const maze: MazeLayout = [];
    for (let j = 0; j < level.length; j++) {
      const str = level[j];
      const line: CellType[] = [];
      for (let i = 0; i < str.length; i++) {
        const char = str[i];

        let cell: CellType;
        switch(char) {
          case "1":
            cell = CellType.Wall;
            break;
          case "_":
            cell = CellType.BoxPlaceholder;
            break;
          case " ":
            cell = CellType.EmptyOutside;
            break;
          default:
            cell = CellType.EmptyInside;
        }
        line.push(cell);

        if (char === "&") {
          this.startPoint = new Vec2(i, j);
        }
        if (char === "x") {
          this.boxes.push([i, j]);
        }
      }
      maze.push(line);
    }
    this.layout = maze;

  }
}

export function getLevels(): Maze[] {
  return levels.map(bp => new Maze(bp));
}
