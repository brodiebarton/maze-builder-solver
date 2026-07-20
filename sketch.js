import p5 from 'p5';
import Maze from './Maze.js';
import MazeBuilder from './MazeBuilder.js';
import MazeSolver_AStar from './MazeSolver_AStar.js';
import AStar_Node from './AStar_Node.js';
import Player from './Player.js';


const mySketch = (sketch) => {
	const cellWidth = 40;
	const cellHeight = 40;
	const MIN_CELLS = 2;
	const UI_RESERVE_PX = 220;
	const VIEWPORT_PADDING_PX = 32;

	const getMaxCellsForScreen = () => {
		const maxCols = Math.floor((window.innerWidth - VIEWPORT_PADDING_PX) / cellWidth);
		const maxRows = Math.floor((window.innerHeight - UI_RESERVE_PX) / cellHeight);
		return Math.max(MIN_CELLS, Math.min(maxCols, maxRows));
	};

	let maxCells = getMaxCellsForScreen();
	let mazeCells = Math.max(MIN_CELLS, Math.floor(maxCells * 0.5));
	let mazeSizeWidth = mazeCells * cellWidth;
	let mazeSizeHeight = mazeCells * cellHeight;

	let MyMaze = new Maze(mazeSizeWidth, mazeSizeHeight, cellWidth, cellHeight);
	let Builder = new MazeBuilder(MyMaze);
	let startIndex = Builder.getCellIndex(MyMaze.cells[0][0]);
	let endIndex = Builder.getCellIndex(MyMaze.cells[MyMaze.numCellsY - 1][MyMaze.numCellsX - 1]);
	let startNode = new AStar_Node(startIndex[1], startIndex[0]);
	let endNode = new AStar_Node(endIndex[1], endIndex[0]);
	let Solver_AStar = new MazeSolver_AStar(startNode, endNode);
	let player = new Player(startNode.posX, startNode.posY);
	let isPlayable = false;
	let hasWon = false;

	const updatePlayStatus = () => {
		const playStatus = document.getElementById("playStatus");
		if (!playStatus) return;
		if (hasWon) {
			playStatus.textContent = "You win!";
		} else if (isPlayable && !Builder.isBuilding) {
			playStatus.textContent = "Use arrow keys to play";
		} else {
			playStatus.textContent = "";
		}
	};

	const syncSizeSlider = () => {
		const slider = document.getElementById("mazeSize");
		const display = document.getElementById("mazeSizeDisplay");
		if (!slider || !display) return;

		maxCells = getMaxCellsForScreen();
		mazeCells = Math.min(mazeCells, maxCells);
		mazeCells = Math.max(MIN_CELLS, mazeCells);

		slider.min = String(MIN_CELLS);
		slider.max = String(maxCells);
		slider.value = String(mazeCells);
		display.textContent = `${mazeCells} x ${mazeCells}`;
	};

	const applyMazeSize = (cells) => {
		mazeCells = cells;
		mazeSizeWidth = mazeCells * cellWidth;
		mazeSizeHeight = mazeCells * cellHeight;
		sketch.resizeCanvas(mazeSizeWidth, mazeSizeHeight);
		resetMaze();
		syncSizeSlider();
	};

	sketch.setup = () => {
		let canvas = sketch.createCanvas(mazeSizeWidth, mazeSizeHeight);
		canvas.parent("sketchContainer");

		// Calculate startNode h and f scores
		startNode.hScore = Solver_AStar.calcHScore(startNode, endNode);
		startNode.fScore = Solver_AStar.calcFScore(startNode);

		const buildBtn = document.getElementById("buildButton");
		buildBtn.addEventListener("click", () => {
			if (!Solver_AStar.isSolving) {
				const wasBuilding = Builder.isBuilding;
				Builder.isBuilding = !Builder.isBuilding;
				if (Builder.isBuilding && !wasBuilding) {
					isPlayable = false;
					hasWon = false;
					player.reset(startNode);
					updatePlayStatus();
				}
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
			resetMaze();
		});

		const sliderMazeSize = document.getElementById("mazeSize");
		syncSizeSlider();
		sliderMazeSize.onchange = () => {
			applyMazeSize(Number(sliderMazeSize.value));
		};

		window.addEventListener("resize", () => {
			const previousMax = maxCells;
			syncSizeSlider();
			if (maxCells !== previousMax && mazeCells > maxCells) {
				applyMazeSize(maxCells);
			}
		});
	}

	sketch.draw = () => {
		sketch.clear();

		// display start and goal
		startNode.color = sketch.color(150, 150, 150);
		displayNode(startNode);
		endNode.color = sketch.color(0, 200, 0);
		displayNode(endNode);

		// display maze
		displayMaze(MyMaze);

		// Build Button Triggers Building Animation
		if (Builder.isBuilding) {
			Builder.build();

		}

		if (Solver_AStar.openList.length > 0) {
			Solver_AStar.openList.forEach((n) => {
				displayNode(n);
			});
		}

		if (Solver_AStar.closedList.length > 0) {
			Solver_AStar.closedList.forEach((n) => {
				displayNode(n);
			});
		}

		if (Solver_AStar.isSolving) {
			Solver_AStar.solve(MyMaze);
			displayNode(Solver_AStar.currentNode);
		}

		if (Solver_AStar.path.length > 0) {
			displaySolvePath(Solver_AStar.path);
		}

		if (!Builder.isBuilding && MyMaze.numVisited === MyMaze.totalCells) {
			if (!isPlayable) {
				isPlayable = true;
				updatePlayStatus();
			}
		}

		if (isPlayable) {
			player.display(sketch, cellWidth, cellHeight);
		}
	}

	sketch.keyPressed = () => {
		if (!isPlayable || Builder.isBuilding || hasWon) return;

		let moved = false;
		if (sketch.keyCode === 38) {
			moved = player.move(MyMaze, -1, 0);
		} else if (sketch.keyCode === 39) {
			moved = player.move(MyMaze, 0, 1);
		} else if (sketch.keyCode === 40) {
			moved = player.move(MyMaze, 1, 0);
		} else if (sketch.keyCode === 37) {
			moved = player.move(MyMaze, 0, -1);
		}

		if (moved && player.hasReachedGoal(endNode)) {
			hasWon = true;
			updatePlayStatus();
		}
	};

	// Display Node
	const displayNode = (node) => {
		if (!node.color) return;
		const c = Array.isArray(node.color)
			? sketch.color(node.color[0], node.color[1], node.color[2])
			: node.color;
		sketch.stroke(c);
		sketch.fill(c);
		sketch.rect((node.posX * cellWidth) + cellWidth / 4, (node.posY * cellHeight) + cellHeight / 4, cellWidth / 2, cellHeight / 2);
	}


	const displayMaze = (maze) => {
		for (let i = 0; i < maze.cells.length; i++) {
			for (let j = 0; j < maze.cells[i].length; j++) {
				let currentCell = maze.cells[i][j];


				let lengthX = currentCell.posX;
				let lengthY = currentCell.posY;

				sketch.stroke('rgb(200,0,100)');


				// top
				if (currentCell.wallVisibility[0]) {
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
						sketch.rect(currentCell.posX + rectPadding, currentCell.posY + rectPadding, currentCell.width - rectPadding * 2, currentCell.height - rectPadding * 2);
					}
				}


			}
		}
	}

	const displaySolvePath = (path) => {
		sketch.noFill();
		sketch.stroke(sketch.color(0, 250, 0));
		sketch.beginShape();
		for (let i = 0; i < path.length; i++) {
			sketch.vertex(path[i].posX * cellWidth + cellWidth / 2, path[i].posY * cellHeight + cellHeight / 2);
		}
		sketch.endShape();
	}

	const resetMaze = () => {
		sketch.clear();
		MyMaze = new Maze(mazeSizeWidth, mazeSizeHeight, cellWidth, cellHeight);
		Builder = new MazeBuilder(MyMaze);
		startIndex = Builder.getCellIndex(MyMaze.cells[0][0]);
		endIndex = Builder.getCellIndex(MyMaze.cells[MyMaze.numCellsY - 1][MyMaze.numCellsX - 1]);
		startNode = new AStar_Node(startIndex[1], startIndex[0]);
		endNode = new AStar_Node(endIndex[1], endIndex[0]);
		Solver_AStar = new MazeSolver_AStar(startNode, endNode);

		player = new Player(startNode.posX, startNode.posY);
		isPlayable = false;
		hasWon = false;
		updatePlayStatus();

		// Calculate startNode h and f scores
		startNode.hScore = Solver_AStar.calcHScore(startNode, endNode);
		startNode.fScore = Solver_AStar.calcFScore(startNode);
	}

}

const sketch = new p5(mySketch);
