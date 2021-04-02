function createEmptyMaze() {
  var maze: number[][] = [];
  for (let j = 0; j < 10; j++) {
    var line: number[] = [];
    for (let i = 0; i < 10; i++) {
      line.push(0);
    }
    maze.push(line);
  }

  return maze;
}

const maze = createEmptyMaze();
console.log(JSON.stringify(maze, null, 4));

function createWalls(maze: number[][]) {
  for (let i = 0; i < 10; i++) {
    let line = maze[i];
    line[0] = 1;
    line[9] = 1;
    maze[0][i] = 1;
    maze[9][i] = 1;
  }
}

createWalls(maze);

console.log(
  JSON.stringify(
    maze.map((l) => l.join(",")),
    null,
    4
  )
);
