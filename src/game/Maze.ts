import { Vec2 } from "../math/vec2";

export type MazeLayout = number[][];

export class Maze {
  public startPoint = new Vec2(1, 1);
  public layout: MazeLayout;
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
  }
}
