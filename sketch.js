let canvas;
let MyMaze;
let Builder;
let Solver_AStar;
let startNode;
let endNode;
let cellWidth;
let cellHeight;

class Maze {
	constructor(width,height) {
		this.width = width;
		this.height = height;
		this.cells = [];
		this.numVisited = 0;
		this.numCellsX = undefined;
		this.numCellsY = undefined;
		this.totalCells = 0;
		this.init();
	}

	init() {
		cellWidth = 40;
		cellHeight = 40;
		this.numCellsX = floor(this.width / cellWidth);
		this.numCellsY = floor(this.height / cellHeight);
		this.totalCells = this.numCellsX * this.numCellsY;

		for (let i = 0; i < this.numCellsY; i++) {
			this.cells.push(new Array(this.numCellsX));
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
		this.wallVisibility = [true,true,true,true];
		this.isVisited = false;
	}

	display(x,y) {
		
		let lx = x * cellWidth;
		let ly = y * cellHeight;
	
		stroke(255);
		// top
		if (this.wallVisibility[0]) {
			this.walls[0] = line(lx,ly,lx + cellWidth, ly);
		}

		// right
		if (this.wallVisibility[1]) {
			this.walls[1] = line(lx + cellWidth, ly, lx + cellWidth, ly + cellHeight);
		}

		// bottom
		if (this.wallVisibility[2]) {
			this.walls[2] = line(lx + cellWidth, ly + cellHeight, lx, ly + cellHeight);
		}

		// left
		if (this.wallVisibility[3]) {
			this.walls[3] = line(lx, ly + cellHeight, lx, ly);
		}

		if (this.isVisited) {
			noStroke();
			fill(color(200,0,0,100));
			rect(x * cellWidth,y * cellHeight,cellWidth,cellHeight);
		}
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

class MazeBuilder {
	constructor(cells) {
		this.currentCell = undefined;
		this.cellStack = [];
		this.mazeCells = cells;
		this.initialize(this.mazeCells);
		this.isBuilding = false;
	}

	initialize(cells) {
		// initialize / assign currentCell
		let i = 0;
		let j = 0;
		this.currentCell = cells[i][j];
		this.currentCell.isVisited = true;
		this.currentCell.wallVisibility[1] = false;
		MyMaze.numVisited++;
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
			let randIndex = floor(random(0,neighbors.length));
			let newPosition = this.getCellIndex(neighbors[randIndex]);

			this.cellStack.push(this.currentCell);

			// remove walls
			this.removeWalls(this.currentCell,this.mazeCells[newPosition[0]][newPosition[1]]);

			this.currentCell = this.mazeCells[newPosition[0]][newPosition[1]];
			this.currentCell.isVisited = true;
			MyMaze.numVisited++;
		} else {
			if (this.cellStack.length > 0) {
				let backTrackCell = this.cellStack.pop();
				this.currentCell = backTrackCell;
			}
		}
		// console.log(`MyMaze.numVisited: ${MyMaze.numVisited}\ntotalCells: ${MyMaze.totalCells}`);

		if (MyMaze.numVisited == MyMaze.totalCells) {
			this.isBuilding = false;
		}
	}
}

class MazeSolver_AStar {
	constructor(start,goal) {
		this.start = start;
		this.goal = goal;
		this.openList = [];
		this.closedList = [];
		this.path = [];
		this.currentNode = start;
		this.isSolving = false;
	}

	calcGScore(node) {
		return this.currentNode.gScore + 1;
	}

	calcHScore(node) {
		let h = abs(node.posX - endNode.posX) + abs(node.posY - endNode.posY);
		return h;
	}

	calcDistance(n1,n2) {
		let d = abs(n1.posX - n2.posX) - abs(n1.posY - n2.posY);
		return d;
	}

	calcFScore(node) {
		return node.gScore + node.hScore;
	}

	solve(maze) {
		// while openlist is not empty
		if (this.openList.length <= 0) {
			this.isSolving = false;
		}
		let lowestFNode = 0;

		for (let i = 0; i < this.openList.length; i++) {
			if (this.openList[i].fScore < this.openList[lowestFNode].fScore) {
				lowestFNode = i;
			}
		}
		this.currentNode = this.openList[lowestFNode];

		if (this.currentNode === endNode) {
			// PATH FOUND
			this.isSolving = false;
		} else {
			// Helper.removeFromArray(this.openList,this.currentNode);
			this.openList.splice(lowestFNode,1);
			this.closedList.push(this.currentNode);
			
			// Find neighboring walkable nodes
			let available = this.checkNeighbors(this.currentNode, maze);

			for (let i = 0; i < available.length; i++) {
				let n = available[i];
				if (!this.closedList.includes(n)) {
					let tempGScore = this.currentNode.gScore + 1;
					let nPath = false;
					if (this.openList.includes(n)) {
						if (tempGScore < n.gScore) {
							n.gScore = tempGScore;
							nPath = true;
						}
					} else {
						n.gScore = tempGScore;
						nPath = true;
						this.openList.push(n);
					}
					if (nPath) {
						n.hScore = this.calcHScore(n);
						n.fScore = this.calcFScore(n);
						n.cameFrom = this.currentNode;
					}
				}
			}

			// available.forEach((n) => {
			// 	if (!this.closedList.includes(n)) {
			// 		if (!this.openList.includes(n)) {
			// 			n.gScore = this.calcGScore(n);
			// 			n.hScore = this.calcHScore(n);
			// 			n.fScore = this.calcFScore(n);
			// 			n.cameFrom = this.currentNode;
			// 			this.openList.push(n);
			// 		} else {

			// 		}
			// 	}
			// });

			console.log("open list:");
			console.log(this.openList);
			console.log("closed list:");
			console.log(this.closedList);
		}
	}

	checkNeighbors(node,maze) {
		let walkableNodes = [];

		// top
		if (node.posY - 1 >= 0) {
			if (maze.cells[node.posY - 1][node.posX].wallVisibility[2] == false) {
				//top
				// console.log(maze.cells[node.posY - 1][node.posX]);
				let wNode = new AStar_Node(node.posX,node.posY - 1);
				walkableNodes.push(wNode);
				// walkableNodes.push(maze.cells[node.posY - 1][node.posX]);
			}
		}
		
		// right
		if (node.posX + 1 < maze.cells[node.posX].length) {
			if (maze.cells[node.posY][node.posX + 1].wallVisibility[3] == false) {
				//right
				// console.log(maze.cells[node.posY][node.posX + 1]);
				let wNode = new AStar_Node(node.posX + 1, node.posY);
				walkableNodes.push(wNode);
				// walkableNodes.push(maze.cells[node.posY][node.posX + 1]);
			}
		}
		// bottom
		if (node.posY + 1 < maze.cells.length) {
			if (maze.cells[node.posY + 1][node.posX].wallVisibility[0] == false) {
				//bottom
				// console.log(maze.cells[node.posY + 1][node.posX]);
				let wNode = new AStar_Node(node.posX,node.posY + 1);
				walkableNodes.push(wNode);
				// walkableNodes.push(maze.cells[node.posY + 1][node.posX]);
			}
		}
		// left
		if (node.posX - 1 >= 0) {
			if (maze.cells[node.posY][node.posX - 1].wallVisibility[1] == false) {
				//left
				// console.log(maze.cells[node.posY][node.posX - 1]);
				let wNode = new AStar_Node(node.posX - 1,node.posY);
				walkableNodes.push(wNode);
				// walkableNodes.push(maze.cells[node.posY][node.posX - 1]);
			}
		}

		walkableNodes.forEach((n) => {
			n.color = color(200,200,200);
		});

		return walkableNodes;
	}
}

class AStar_Node {
	constructor(x,y) {
		this.posX = x;
		this.posY = y;
		this.cameFrom = undefined;
		this.gScore = 0;
		this.hScore = 0;
		this.fScore = 0;
		this.color = color(200,200,200);
	}

	display() {
		stroke(this.color);
		noFill();
		rect((this.posX * cellWidth) + cellWidth / 4,(this.posY * cellHeight) + cellHeight / 4, cellWidth / 2, cellHeight / 2);
	}
}

function setup() {
	canvas = createCanvas(401, 401);
	canvas.parent("sketch-container1");
	MyMaze = new Maze(400,400);
	Builder = new MazeBuilder(MyMaze.cells);
	let startIndex = Builder.getCellIndex(MyMaze.cells[0][0]);
	let endIndex = Builder.getCellIndex(MyMaze.cells[MyMaze.numCellsY - 1][MyMaze.numCellsX - 1]);
	
	startNode = new AStar_Node(startIndex[1],startIndex[0]);
	endNode = new AStar_Node(endIndex[1],endIndex[0]);
	Solver_AStar = new MazeSolver_AStar(startNode,endNode);

	// Calculate startNode h and f scores
	startNode.hScore = Solver_AStar.calcHScore(startNode);
	startNode.fScore = Solver_AStar.calcFScore(startNode);

	Solver_AStar.openList.push(startNode);

	const buildBtn = document.getElementById("buildButton");
	buildBtn.addEventListener("click", () => {
		Builder.isBuilding = !Builder.isBuilding;
		// Builder.build();
	});

	const solveBtn = document.getElementById("solveButton");
	solveBtn.addEventListener("click", () => {
		// Solver_AStar.solve(MyMaze);
		Solver_AStar.isSolving = !Solver_AStar.isSolving;
	});

	
}

function draw() {
	background(color(10,10,10));
	

	//display start and goal
	startNode.color = color(150,150,150);
	startNode.display();
	endNode.color = color(0,200,0);
	endNode.display();

	// display maze
	for (let i = 0; i < MyMaze.cells.length; i++) {
		for (let j = 0; j < MyMaze.cells[i].length; j++) {
			MyMaze.cells[i][j].display(j,i);
		}
	}

	// Build Button Triggers Building Animation
	if (Builder.isBuilding) {
		Builder.build();
	}

	if (Solver_AStar.isSolving) {
		Solver_AStar.solve(MyMaze);
	}

	if(Solver_AStar.openList.length > 0) {
		Solver_AStar.openList.forEach((n) => {
			n.display();
		});
	}

	if(Solver_AStar.closedList.length > 0) {
		Solver_AStar.closedList.forEach((n) => {
			n.color = color(255,0,0);
			n.display();
		});
	}
	
}

// function windowResized() {
// 	resizeCanvas(windowWidth,400);
// }