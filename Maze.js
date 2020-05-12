export default class Maze {
	constructor(width, height, cellWidth, cellHeight) {
		this.width = width;
		this.height = height;
		this.cellWidth = cellWidth;
		this.cellHeight = cellHeight;
		this.cells = [];
		this.numVisited = 0;
		this.numCellsX = undefined;
		this.numCellsY = undefined;
		this.totalCells = 0;
		this.init();
	}

	init() {
		this.numCellsX = Math.floor(this.width / this.cellWidth);
		this.numCellsY = Math.floor(this.height / this.cellHeight);
		this.totalCells = this.numCellsX * this.numCellsY;

		for (let i = 0; i < this.numCellsY; i++) {
			this.cells.push(new Array(this.numCellsX));
			for (let j = 0; j < this.cells[i].length; j++) {
				this.cells[i][j] = new Cell(this.cellWidth, this.cellHeight, this.cellWidth, this.cellHeight);
				this.cells[i][j].posX = this.cells[i][j].x * j;
				this.cells[i][j].posY = this.cells[i][j].y * i;
			}
		}
	}
}

class Cell {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.posX = undefined;
		this.posY = undefined;
		this.walls = new Array(4);
		this.wallVisibility = [true,true,true,true];
		this.isVisited = false;
	}

	

	// Check neighboring cells
	// Collect unvisited cells
	checkNeighbors(rowIndex, colIndex, maze) {
		let unvisitedCells = [];

		// top
		if (rowIndex - 1 >= 0) {
			if (!maze[rowIndex - 1][colIndex].isVisited) {
				unvisitedCells.push(maze[rowIndex - 1][colIndex]);
			}
		}
		// right
		if (colIndex + 1 < maze[rowIndex].length) {
			if (!maze[rowIndex][colIndex + 1].isVisited) {
				unvisitedCells.push(maze[rowIndex][colIndex + 1]);
			}
		}
		// bottom
		if (rowIndex + 1 < maze.length) {
			if (!maze[rowIndex + 1][colIndex].isVisited) {
				unvisitedCells.push(maze[rowIndex + 1][colIndex]);
			}
		}
		// left
		if (colIndex - 1 >= 0) {
			if (!maze[rowIndex][colIndex - 1].isVisited) {
				unvisitedCells.push(maze[rowIndex][colIndex - 1]);
			}
		}

		return unvisitedCells;
	}
}