let canvas;
let MyMaze;
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
			}
		}
	}
}

/* Recursive Backtracker
* 1. Make the initial cell the current cell and mark it as visited
* 2. While there are unvisited cells
*	A. If the current cell has any neighbours which have not been visited
*		1. Choose randomly one of the unvisited neighbours
*		2. Push the current cell to the stack
*		3. Remove the wall between the current cell and the chosen cell
*		4. Make the chosen cell the current cell and mark it as visited
*	B. Else if stack is not empty
*		1. Pop a cell from the stack
*		2. Make it the current cell
*/ 

class Cell {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.walls = new Array(4);
		this.isVisited = false;
	}
	get area() {
		return this.x * this.y;
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

function setup() {
	canvas = createCanvas(400, 400);
	MyMaze = new Maze(400,400);
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