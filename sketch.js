let canvas;
let MyMaze;
let Builder;
let cellWidth;
let cellHeight;

class Maze {
	constructor(width,height) {
		this.width = width;
		this.height = height;
		this.cells = [];
		this.build();
	}

	build() {
		cellWidth = 40;
		cellHeight = 40;
		let numCellsX = floor(this.width / cellWidth);
		let numCellsY = floor(this.height / cellHeight);
		for (let i = 0; i < numCellsY; i++) {
			this.cells.push(new Array(numCellsX));
			for (let j = 0; j < this.cells[i].length; j++) {
				this.cells[i][j] = new Cell(cellWidth,cellHeight);
				this.cells[i][j].posX = this.cells[i][j].x * j;
				this.cells[i][j].posY = this.cells[i][j].y * i;
			}
		}
	}
}

class Cell {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.posX = undefined;
		this.posY = undefined;
		this.walls = new Array(4);
		this.isVisited = false;
	}

	display(x,y) {
		
		let lx = y * cellWidth;
		let ly = x * cellHeight;

		stroke(255);
		// top
		this.walls[0] = line(lx,ly,lx + cellWidth, ly);

		// right
		this.walls[1] = line(lx + cellWidth, ly, lx + cellWidth, ly + cellHeight);

		// bottom
		this.walls[2] = line(lx + cellWidth, ly + cellHeight, lx, ly + cellHeight);

		// left
		this.walls[3] = line(lx, ly + cellHeight, lx, ly);

		if (this.isVisited) {
			fill(color(200,0,0));
			rect(x * cellWidth,y * cellHeight,cellWidth,cellHeight);
		}
	}

	// Check neighboring cells
	// Collect unvisited cells
	checkNeighbors(rowIndex, colIndex, maze) {
		let unvisitedCells = [];

		console.log(`top = ${rowIndex - 1}, ${colIndex}`);
		console.log(`right = ${rowIndex}, ${colIndex + 1}`);
		console.log(`bottom = ${rowIndex + 1}, ${colIndex}`);
		console.log(`left = ${rowIndex}, ${colIndex - 1}`);

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

class MazeBuilder {
	constructor(cells) {
		this.currentCell = undefined;
		this.cellStack = [];
		this.mazeCells = cells;
		this.initialize(this.mazeCells);
	}

	initialize(cells) {
		// initialize / assign currentCell
		let i = 0;
		let j = 0;
		this.currentCell = cells[i][j];
		this.currentCell.isVisited = true;
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

	build() {
		let indexes = this.getCellIndex(this.currentCell);

		let neighbors = this.currentCell.checkNeighbors(indexes[0], indexes[1],this.mazeCells);
		
		let randIndex = floor(random(0,neighbors.length));
		let newPosition = this.getCellIndex(neighbors[randIndex]);

		this.cellStack.push(this.currentCell);
		console.log("stack length = " + this.cellStack.length);
		console.log(`new pos: ${newPosition[0]} , ${newPosition[1]}`);

		// this.currentCell = this.mazeCells[newPosition[0],newPosition[1]];
		// this.currentCell.isVisited = true;
		
	}
}

function setup() {
	canvas = createCanvas(400, 400);
	canvas.parent("sketch-container1");
	MyMaze = new Maze(400,400);
	Builder = new MazeBuilder(MyMaze.cells);

	const buildBtn = document.getElementById("buildButton");
	buildBtn.addEventListener("click", () => {
		Builder.build();
	});

	const solveBtn = document.getElementById("solveButton");
	solveBtn.addEventListener("click", () => {

	});

	
}

function draw() {
	background(color(10,10,10));
	for (let i = 0; i < MyMaze.cells.length; i++) {
		for (let j = 0; j < MyMaze.cells[i].length; j++) {
			MyMaze.cells[i][j].display(j,i);
		}
	}

}

// function windowResized() {
// 	resizeCanvas(windowWidth,400);
// }