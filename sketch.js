import p5 from 'p5';
import Maze from './Maze';
import MazeBuilder from './MazeBuilder';
import MazeSolver_AStar from './MazeSolver_AStar';
import AStar_Node from './AStar_Node';


const mySketch = (sketch) => {
	let mazeSizeWidth = 600;
	let mazeSizeHeight = 600;
	const cellWidth = 40;
	const cellHeight = 40;
	let MyMaze = new Maze(mazeSizeWidth, mazeSizeHeight, cellWidth, cellHeight);
	let Builder = new MazeBuilder(MyMaze);
	let startIndex = Builder.getCellIndex(MyMaze.cells[0][0]);
	let endIndex = Builder.getCellIndex(MyMaze.cells[MyMaze.numCellsY - 1][MyMaze.numCellsX - 1]);
	let startNode = new AStar_Node(startIndex[1],startIndex[0]);
	let endNode = new AStar_Node(endIndex[1],endIndex[0]);
	let Solver_AStar = new MazeSolver_AStar(startNode,endNode);

	sketch.setup = () => {
		let canvas = sketch.createCanvas(mazeSizeWidth , mazeSizeHeight);
		canvas.parent("sketchContainer");

		// Calculate startNode h and f scores
		startNode.hScore = Solver_AStar.calcHScore(startNode, endNode);
		startNode.fScore = Solver_AStar.calcFScore(startNode);

		// SAgent = new SimpleAgent(startNode.posX,startNode.posY);

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
			sketch.clear();
			// \/ Should refactor into function \/
			MyMaze = new Maze(mazeSizeWidth, mazeSizeHeight, cellWidth, cellHeight);
			Builder = new MazeBuilder(MyMaze);
			startIndex = Builder.getCellIndex(MyMaze.cells[0][0]);
			endIndex = Builder.getCellIndex(MyMaze.cells[MyMaze.numCellsY - 1][MyMaze.numCellsX - 1]);
			startNode = new AStar_Node(startIndex[1],startIndex[0]);
			endNode = new AStar_Node(endIndex[1],endIndex[0]);
			Solver_AStar = new MazeSolver_AStar(startNode,endNode);

			// Calculate startNode h and f scores
			startNode.hScore = Solver_AStar.calcHScore(startNode, endNode);
			startNode.fScore = Solver_AStar.calcFScore(startNode);

			// SAgent = new SimpleAgent(startNode.posX,startNode.posY);
		});

		// enable when finished
		// const agentBtn = document.getElementById("sAgentButton");

		// agentBtn.addEventListener("click", () => {
		// 	SAgent.checkWalls(MyMaze.cells[SAgent.posY][SAgent.posX]);
		// 	SAgent.move();
		// });
		
		let sliderMazeWidth = document.getElementById("mazeWidth");
		let sliderMazeHeight = document.getElementById("mazeHeight");
		let sliderMWDisplay = document.getElementById("mazeW");
		let sliderMHDisplay = document.getElementById("mazeH");

		sliderMazeWidth.setAttribute("max", canvas.width);
		sliderMazeWidth.setAttribute("value", mazeSizeWidth);

		sliderMazeHeight.setAttribute("max", canvas.height);
		sliderMazeHeight.setAttribute("value", mazeSizeHeight);

		sliderMazeWidth.onchange = () => {
			mazeSizeWidth = sliderMazeWidth.value;
			sliderMWDisplay.innerHTML = sliderMazeWidth.value;
		};
		sliderMazeHeight.onchange = () => {
			mazeSizeHeight = sliderMazeHeight.value;
			sliderMHDisplay.innerHTML = sliderMazeHeight.value;
		};
	}

	sketch.draw = () => {
		sketch.clear();
		// sketch.background(sketch.color(10,10,10));

		// stroke(this.color);
		// fill(this.color);
		// rect((this.posX * cellWidth) + cellWidth / 4,(this.posY * cellHeight) + cellHeight / 4, cellWidth / 2, cellHeight / 2);

		// display start and goal
		startNode.color = sketch.color(150,150,150);
		displayNode(startNode);
		endNode.color = sketch.color(0,200,0);
		displayNode(endNode);

		// display maze
		displayMaze(MyMaze);
		
		// Build Button Triggers Building Animation
		if (Builder.isBuilding) {
			// sketch.setFrameRate(100);
			Builder.build();
			
		}

		if(Solver_AStar.openList.length > 0) {
			Solver_AStar.openList.forEach((n) => {
				displayNode(n);
			});
		}

		if(Solver_AStar.closedList.length > 0) {
			Solver_AStar.closedList.forEach((n) => {
				// n.color = sketch.color(255,0,0);
				displayNode(n);
			});
		}

		if (Solver_AStar.isSolving) {
			// sketch.setFrameRate(15);
			Solver_AStar.solve(MyMaze);
			// Solver_AStar.currentNode.color = sketch.color(0,200,0);
			displayNode(Solver_AStar.currentNode);
		}

		if(Solver_AStar.path.length > 0) {
			Solver_AStar.showPath();
		}
	}

	// Display Node
	const displayNode = (node) => {
		sketch.stroke(node.color);
		sketch.fill(node.color);
		sketch.rect((node.posX * cellWidth) + cellWidth / 4, (node.posY * cellHeight) + cellHeight / 4, cellWidth / 2, cellHeight / 2);
	}


	const displayMaze = (maze) => {
		for (let i = 0; i < maze.cells.length; i++) {
			for (let j = 0; j < maze.cells[i].length; j++) {
				let currentCell = maze.cells[i][j];

				
				let lengthX = currentCell.posX ;
				let lengthY = currentCell.posY ;
			
				sketch.stroke('rgb(200,0,100)');
				

				// top
				if (currentCell.wallVisibility[0]) {
					// currentCell.walls[0] = sketch.line(lx,ly,lx + currentCell.width, ly);
					// sketch.line(lx,ly,lx + currentCell.width, ly);
					currentCell.walls[0] = sketch.line(lengthX, lengthY, lengthX + currentCell.width, lengthY);
				}
		
				// right
				if (currentCell.wallVisibility[1]) {
					currentCell.walls[1] = sketch.line(lengthX + currentCell.width, lengthY, lengthX + currentCell.width, lengthY + currentCell.height);
				}
		
				// bottom
				if (currentCell.wallVisibility[2]) {
					currentCell.walls[2] = sketch.line(lengthX + currentCell.width, lengthY + currentCell.height, lengthX, lengthY + currentCell.height);
				}
		
				// left
				if (currentCell.wallVisibility[3]) {
					currentCell.walls[3] = sketch.line(lengthX, lengthY + currentCell.height, lengthX, lengthY);
				}
				
				if (Builder.isBuilding) {
					if (currentCell.isVisited) {
						sketch.noStroke();
						sketch.fill('rgb(0,100,100)');
						const rectPadding = 8;
						sketch.rect(currentCell.posX + rectPadding , currentCell.posY + rectPadding , currentCell.width - rectPadding * 2 , currentCell.height - rectPadding * 2 );
					}
				}
				

			}
		}
	}
		
}

const sketch = new p5(mySketch);