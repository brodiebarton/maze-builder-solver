let canvas;
let MyMaze;
let Builder;
let Solver_AStar;
let SAgent;
let startNode;
let endNode;
let cellWidth;
let cellHeight;
let mazeSizeWidth;
let mazeSizeHeight;

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

class SimpleAgent {
	constructor(startX,startY) {
		this.posX = startX;
		this.posY = startY;
		this.prevNode = undefined;
		this.deltaX = 0;
		this.deltaY = 0;
		this.color = color(0,0,255);
		this.direction = undefined;
		this.availableMoves = [false,false,false,false]; // top, right, down, left
	}

	determineDirection() {
		// Is At StartNode
		if (this.posX == startNode.posX && this.posY == startNode.posY) {
			if (MyMaze.cells[startNode.posY][startNode.posX].wallVisibility[0] == false) {
				this.deltaY = -1;
				return "up";
			}
			if (MyMaze.cells[startNode.posY][startNode.posX].wallVisibility[1] == false) {
				this.deltaX = 1;
				return "right";
			}
			if (MyMaze.cells[startNode.posY][startNode.posX].wallVisibility[2] == false) {
				this.deltaY = 1;
				return "down";
			}
			if (MyMaze.cells[startNode.posY][startNode.posX].wallVisibility[3] == false) {
				this.deltaX = -1;
				return "left";
			}
		}
		if (this.prevNode != undefined) {
			this.deltaX = this.posX - this.prevNode.posX;
			this.deltaY = this.posY - this.prevNode.posY;
			
			// Moved Left
			if (this.deltaX == -1) {
				console.log("FACING LEFT");
				return "left";
			}

			// Moved Right
			if (this.deltaX == 1) {
				console.log("FACING RIGHT");
				return "right";
			}

			// Moved Up
			if (this.deltaY == -1) {
				console.log("FACING UP");
				return "up";
			}

			// Moved Down
			if (this.deltaY == 1) {
				console.log("FACING DOWN");
				return "down";
			}
		}
	}

	move() {

		// if can move left
		if (this.availableMoves[3] == true) {
			// move left
			this.posX = this.posX - 1;
			this.prevNode = MyMaze.cells[this.posY][this.posX + 1];
		}

		let cantGoStraight = false;
		// if cannot move left 
		let direction = this.determineDirection();
		console.log(direction);
		if (this.availableMoves[3] == false) {
			// go straight
			if (this.deltaX != 0) {
				this.posX = this.posX + this.deltaX;
				this.prevNode = MyMaze.cells[this.posY][this.posX - this.deltaX];
			} else if (this.deltaY != 0) {
				this.posY = this.posY + this.deltaY;
				this.prevNode = MyMaze.cells[this.posY - this.deltaY][this.posX];
			} else {
				cantGoStraight = true;
			}
		}
		// if cannot move left, 
		if (this.availableMoves[3] == false) {
			// and cannot go straight
			if (cantGoStraight) {
				// go right
				this.posX = this.posX + 1;
				this.prevNode = MyMaze.cells[this.posY][this.posX - 1];
			}
		}
		
		// if cannot go left, 
		if (this.availableMoves[3] == false) {
			// and cannot go straight 
			if (cantGoStraight) {
				// and not right
				if (this.availableMoves[1] == false) {

				}

			}
		}

		//or right,
		// turn around
	}

	checkWalls(currentPos) {
		let indexOfCurrent = Builder.getCellIndex(currentPos);
		console.log(currentPos);
		if (currentPos.wallVisibility[0] == false) {
			console.log("CAN MOVE UP");
			this.availableMoves[0] = true;
		}
		if (currentPos.wallVisibility[1] == false) {
			console.log("CAN MOVE RIGHT");
			this.availableMoves[1] = true;
		}
		if (currentPos.wallVisibility[2] == false) {
			console.log("CAN MOVE DOWN");
			this.availableMoves[2] = true;
		}
		if (currentPos.wallVisibility[3] == false) {
			console.log("CAN MOVE LEFT");
			this.availableMoves[3] = true;
		}
	}

	display() {
		fill(this.color);
		ellipse((this.posX * cellWidth) + cellWidth / 2,(this.posY * cellHeight) + cellHeight / 2, cellWidth / 1.5, cellHeight / 1.5);
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

		if (MyMaze.numVisited == MyMaze.totalCells) {
			this.isBuilding = false;
		}
	}
}

class MazeSolver_AStar {
	constructor(start,goal) {
		this.start = start;
		this.goal = goal;
		this.openList = [start];
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

	compareNodes(n1,n2) {
		if (n1.posX === n2.posX && n1.posY === n2.posY) {
			// nodes at same location
			return true;
		}
		// if nodes not at same location
		return false;
	}

	checkList(n, thisList) {
		for (let i = 0; i < thisList.length; i++) {
			if(n.posX === thisList[i].posX && n.posY === thisList[i].posY) {
				// n is in list
				return true;
			}
		}
		// n is not in list
		return false;
	}

	constructPath(cNode) {
		let tempNode = cNode;
		this.path.push(tempNode);

		while(tempNode.cameFrom) {
			this.path.push(tempNode.cameFrom);
			tempNode = tempNode.cameFrom;
		}
	}

	showPath() {
		noFill();
		stroke(color(0,250,0));
		beginShape();
		for (let i = 0; i < this.path.length; i++) {
			vertex(this.path[i].posX * cellWidth + cellWidth / 2, this.path[i].posY * cellHeight + cellHeight / 2);
		}
		endShape();
	}

	solve(maze) {
		// while openlist is not empty
		if (this.openList.length <= 0) {
			this.isSolving = false;
		}

		// Chose nod with lowesy f score
		let lowestFNode = 0;
		for (let i = 0; i < this.openList.length; i++) {
			if (this.openList[i].fScore < this.openList[lowestFNode].fScore) {
				lowestFNode = i;
			}
		}
		
		this.currentNode = this.openList[lowestFNode];

		// Check if currentNode is the goal
		let isCurrentTheGoal = this.compareNodes(this.currentNode,endNode);
		if (isCurrentTheGoal) {
			// PATH FOUND
			this.isSolving = false;
			this.constructPath(this.currentNode);
			// RETURN PATH
			return;
		} else {
			Helper.removeFromArray(this.openList,this.currentNode);
			this.closedList.push(this.currentNode);
			
			// Find neighboring walkable nodes
			let available = this.checkNeighbors(this.currentNode, maze);

			// For each available neighbor
			available.forEach((n) => {

				// Check if n is in closedList
				let isInClosedList = this.checkList(n,this.closedList);
				if (isInClosedList) {
					// SKIP
					return;
				}
				
				let tempGScore = n.gScore + this.calcHScore(this.currentNode,n);

				// Check if n is NOT in openList
				let isInOpenList = this.checkList(n,this.openList);
				if (!isInOpenList) {
					this.openList.push(n);
				} else if (tempGScore >= n.gScore) {
					return;
				}
				
				n.cameFrom = this.currentNode;
				n.gScore = tempGScore;
				n.fScore = n.gScore + this.calcHScore(n,endNode);	
			});
		}
	}

	checkNeighbors(node,maze) {
		let walkableNodes = [];
		if (node.posY) {
			
		}

		// top
		if (node.posY - 1 >= 0) {
			if (maze.cells[node.posY - 1][node.posX].wallVisibility[2] == false) {
				//top
				let wNode = new AStar_Node(node.posX,node.posY - 1);
				walkableNodes.push(wNode);
			}
		}
		
		// right
		if (node.posX + 1 < maze.numCellsX) {
			if (maze.cells[node.posY][node.posX + 1].wallVisibility[3] == false) {
				//right
				let wNode = new AStar_Node(node.posX + 1, node.posY);
				walkableNodes.push(wNode);
			}
		}
		// bottom
		if (node.posY + 1 < maze.numCellsY) {
			if (maze.cells[node.posY + 1][node.posX].wallVisibility[0] == false) {
				//bottom
				let wNode = new AStar_Node(node.posX,node.posY + 1);
				walkableNodes.push(wNode);
			}
		}
		// left
		if (node.posX - 1 >= 0) {
			if (maze.cells[node.posY][node.posX - 1].wallVisibility[1] == false) {
				//left
				let wNode = new AStar_Node(node.posX - 1,node.posY);
				walkableNodes.push(wNode);
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
		this.pos = [x,y];
		this.cameFrom = undefined;
		this.gScore = 0;
		this.hScore = 0;
		this.fScore = 0;
		this.color = color(200,200,200);
	}

	display() {
		stroke(this.color);
		fill(this.color);
		rect((this.posX * cellWidth) + cellWidth / 4,(this.posY * cellHeight) + cellHeight / 4, cellWidth / 2, cellHeight / 2);
	}
}

function setup() {
	canvas = createCanvas(601, 601);
	canvas.parent("sketch-container1");
	mazeSizeWidth = 600;
	mazeSizeHeight = 600;
	
	
	MyMaze = new Maze(mazeSizeWidth,mazeSizeHeight);
	Builder = new MazeBuilder(MyMaze.cells);
	let startIndex = Builder.getCellIndex(MyMaze.cells[0][0]);
	let endIndex = Builder.getCellIndex(MyMaze.cells[MyMaze.numCellsY - 1][MyMaze.numCellsX - 1]);
	
	startNode = new AStar_Node(startIndex[1],startIndex[0]);
	endNode = new AStar_Node(endIndex[1],endIndex[0]);
	Solver_AStar = new MazeSolver_AStar(startNode,endNode);

	// Calculate startNode h and f scores
	startNode.hScore = Solver_AStar.calcHScore(startNode);
	startNode.fScore = Solver_AStar.calcFScore(startNode);

	SAgent = new SimpleAgent(startNode.posX,startNode.posY);

	const buildBtn = document.getElementById("buildButton");
	buildBtn.addEventListener("click", () => {
		if (!Solver_AStar.isSolving) {
			Builder.isBuilding = !Builder.isBuilding;
		}
	});

	const solveBtn = document.getElementById("solveButton");
	solveBtn.addEventListener("click", () => {
		if (!Builder.isBuilding) {
			if (Builder.cellStack.length > 0) {
				Solver_AStar.isSolving = !Solver_AStar.isSolving;
			}
		}
	});

	const resetBtn = document.getElementById("resetButton");
	resetBtn.addEventListener("click", () => {
		// \/ Should refactor into function \/
		MyMaze = new Maze(mazeSizeWidth,mazeSizeHeight);
		Builder = new MazeBuilder(MyMaze.cells);
		let startIndex = Builder.getCellIndex(MyMaze.cells[0][0]);
		let endIndex = Builder.getCellIndex(MyMaze.cells[MyMaze.numCellsY - 1][MyMaze.numCellsX - 1]);
		
		startNode = new AStar_Node(startIndex[1],startIndex[0]);
		endNode = new AStar_Node(endIndex[1],endIndex[0]);
		Solver_AStar = new MazeSolver_AStar(startNode,endNode);

		// Calculate startNode h and f scores
		startNode.hScore = Solver_AStar.calcHScore(startNode);
		startNode.fScore = Solver_AStar.calcFScore(startNode);

		SAgent = new SimpleAgent(startNode.posX,startNode.posY);
	});

	// enable when finished
	// const agentBtn = document.getElementById("sAgentButton");

	// agentBtn.addEventListener("click", () => {
	// 	SAgent.checkWalls(MyMaze.cells[SAgent.posY][SAgent.posX]);
	// 	SAgent.move();
	// });
	
	sliderMazeWidth = document.getElementById("mazeWidth");
	sliderMazeHeight = document.getElementById("mazeHeight");
	sliderMWDisplay = document.getElementById("mazeW");
	sliderMHDisplay = document.getElementById("mazeH");

	sliderMazeWidth.setAttribute("max",canvas.width);
	sliderMazeWidth.setAttribute("value",mazeSizeWidth);

	sliderMazeHeight.setAttribute("max",canvas.height);
	sliderMazeHeight.setAttribute("value",mazeSizeHeight);

	sliderMazeWidth.onchange = () => {
		mazeSizeWidth = sliderMazeWidth.value;
		sliderMWDisplay.innerHTML = sliderMazeWidth.value;
	};
	sliderMazeHeight.onchange = () => {
		mazeSizeHeight = sliderMazeHeight.value;
		sliderMHDisplay.innerHTML = sliderMazeHeight.value;
	};


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
		setFrameRate(100);
		Builder.build();
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

	if (Solver_AStar.isSolving) {
		setFrameRate(15);
		Solver_AStar.solve(MyMaze);
		Solver_AStar.currentNode.color = color(0,250,0);
		Solver_AStar.currentNode.display();
	}

	if(Solver_AStar.path.length > 0) {
		Solver_AStar.showPath();
	}
	
}