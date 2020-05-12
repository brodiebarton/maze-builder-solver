// import Maze from './Maze';

export default class MazeBuilder {

	constructor(maze) {
		this.maze = maze;
		this.currentCell = undefined;
		this.cellStack = [];
		this.mazeCells = this.maze.cells;
		this.isBuilding = false;
		this.initialize(this.maze);
	}

	initialize() {
		// initialize / assign currentCell
		let i = 0;
		let j = 0;
		this.currentCell = this.maze.cells[i][j];
		this.currentCell.isVisited = true;
		this.maze.numVisited++;
	}

	getCellIndex(c) {
		let index2D = new Array(2);

		for (let i = 0; i < this.mazeCells.length; i++) {
			let index2 = this.mazeCells[i].findIndex(x => x === c);
			if (index2 != -1) {
				index2D[1] = index2;
				index2D[0] = i;
			}
		}

		return index2D;
	}

	removeWalls(currentCell, nextCell) {
		let cIndexes = this.getCellIndex(currentCell);
		let nIndexes = this.getCellIndex(nextCell);

		let xMove = nIndexes[1] - cIndexes[1];
		let yMove = nIndexes[0] - cIndexes[0];

		if (xMove == -1) {
			this.mazeCells[cIndexes[0]][cIndexes[1]].wallVisibility[3] = false;
			this.mazeCells[nIndexes[0]][nIndexes[1]].wallVisibility[1] = false;
		}
		if (xMove == 1) {
			this.mazeCells[cIndexes[0]][cIndexes[1]].wallVisibility[1] = false;
			this.mazeCells[nIndexes[0]][nIndexes[1]].wallVisibility[3] = false;
		}
		if (yMove == -1) {
			this.mazeCells[cIndexes[0]][cIndexes[1]].wallVisibility[0] = false;
			this.mazeCells[nIndexes[0]][nIndexes[1]].wallVisibility[2] = false;
		}
		if (yMove == 1) {
			this.mazeCells[cIndexes[0]][cIndexes[1]].wallVisibility[2] = false;
			this.mazeCells[nIndexes[0]][nIndexes[1]].wallVisibility[0] = false;
		}
	}

	build() {
		let indexes = this.getCellIndex(this.currentCell);

		let neighbors = this.currentCell.checkNeighbors(indexes[0], indexes[1],this.mazeCells);
		
		if (neighbors.length > 0) {
			let randIndex = Math.floor((Math.random() * neighbors.length));
			let newPosition = this.getCellIndex(neighbors[randIndex]);

			this.cellStack.push(this.currentCell);

			// remove walls
			this.removeWalls(this.currentCell, this.mazeCells[newPosition[0]][newPosition[1]]);

			this.currentCell = this.mazeCells[newPosition[0]][newPosition[1]];
			this.currentCell.isVisited = true;
			this.maze.numVisited++;
		} else {
			if (this.cellStack.length > 0) {
				let backTrackCell = this.cellStack.pop();
				this.currentCell = backTrackCell;
			}
		}
		// Stops building when no unvisited cells
		if (this.maze.numVisited == this.maze.totalCells) {
			this.isBuilding = false;
		}
	}
}