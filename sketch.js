let canvas;
let MyMaze;
let Solver;
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
		line(lx,ly,lx + cellWidth, ly);

		// right
		line(lx + cellWidth, ly, lx + cellWidth, ly + cellHeight);

		// bottom
		line(lx + cellWidth, ly + cellHeight, lx, ly + cellHeight);

		// left
		line(lx, ly + cellHeight, lx, ly);

		// fill(255);
		// rect(x * cellWidth,y * cellHeight,cellWidth,cellHeight);
	}
}

class MazeSolver {
	constructor(cells) {
		this.currentCell = undefined;
		this.cellStack = [];
		this.initialize(cells);
		console.log(`${this.currentCell.posX} , ${this.currentCell.posY}`);
	}

	initialize(cells) {
		// initialize cellStack
		for (let i = cells.length - 1; i >= 0; i--) {
			for (let j = cells[i].length - 1; j >= 0; j--) {
				this.cellStack.push(cells[i][j]);
			}
		}
		// initialize / assign currentCell
		this.currentCell = this.cellStack.pop();
	}

	solve() {

	}
}

function setup() {
	canvas = createCanvas(400, 400);
	MyMaze = new Maze(400,400);
	Solver = new MazeSolver(MyMaze.cells);
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