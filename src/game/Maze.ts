import { Vec2 } from "../math/vec2";

export type MazeLayout = number[][];
type Pos = [x: number, y: number];

export class Maze {
  public startPoint = new Vec2(1, 1);
  public layout: MazeLayout;
  public boxes: Pos[] = [];

  constructor() {
    const maze: MazeLayout = [];
    for (let j = 0; j < 10; j++) {
      var line: number[] = [];
      for (let i = 0; i < 10; i++) {
        const wall = i === 0 || i === 9 || j === 0 || j === 9;
        line.push(wall ? 1 : 0);
      }
      maze.push(line);
    }
    this.layout = maze;

    const freeCells: Pos[] = [];
    for (let j = 0; j < 10; j++) {
      const line = maze[j];
      for (let i = 0; i < 10; i++) {
        if (line[i] === 0 && (i !== this.startPoint.x || j !== this.startPoint.y)) freeCells.push([i, j]);
      }
    }
    //shuffle
    freeCells.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 3; i++) {
      this.boxes.push(freeCells.shift()!);
    }
  }
}
