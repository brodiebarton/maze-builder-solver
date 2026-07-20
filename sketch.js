import p5 from 'p5';
import Maze from './Maze.js';
import MazeBuilder from './MazeBuilder.js';
import MazeSolver_AStar from './MazeSolver_AStar.js';
import AStar_Node from './AStar_Node.js';
import Player from './Player.js';
import SimpleAgent from './SimpleAgent.js';


const mySketch = (sketch) => {
	const cellWidth = 40;
	const cellHeight = 40;
	const MIN_CELLS = 2;
	const UI_RESERVE_PX = 360;
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
	let agent = new SimpleAgent(startNode.posX, startNode.posY, "medium");
	let isPlayable = false;
	let hasWon = false;
	let raceEnabled = false;
	let raceStarted = false;
	let agentWon = false;

	let playerTimerStart = null;
	let playerTimerElapsedMs = 0;
	let playerTimerRunning = false;
	let solverTimerStart = null;
	let solverTimerElapsedMs = 0;
	let solverTimerRunning = false;
	let wasSolverRunning = false;

	const formatSeconds = (ms) => `${(ms / 1000).toFixed(2)}s`;

	const updateTimerDisplays = () => {
		const playerTimerEl = document.getElementById("playerTimer");
		const solverTimerEl = document.getElementById("solverTimer");
		const moveCountEl = document.getElementById("moveCount");
		const now = performance.now();

		const playerMs = playerTimerRunning && playerTimerStart !== null
			? now - playerTimerStart
			: playerTimerElapsedMs;
		const solverMs = solverTimerRunning && solverTimerStart !== null
			? now - solverTimerStart
			: solverTimerElapsedMs;

		if (playerTimerEl) playerTimerEl.textContent = `Player: ${formatSeconds(playerMs)}`;
		if (solverTimerEl) solverTimerEl.textContent = `Solver: ${formatSeconds(solverMs)}`;
		if (moveCountEl) moveCountEl.textContent = `Moves: ${player.moveCount}`;
	};

	const resetTimers = () => {
		playerTimerStart = null;
		playerTimerElapsedMs = 0;
		playerTimerRunning = false;
		solverTimerStart = null;
		solverTimerElapsedMs = 0;
		solverTimerRunning = false;
		wasSolverRunning = false;
		updateTimerDisplays();
	};

	const updatePlayStatus = () => {
		const playStatus = document.getElementById("playStatus");
		if (!playStatus) return;
		if (agentWon) {
			playStatus.textContent = "AI wins!";
		} else if (hasWon) {
			playStatus.textContent = raceEnabled ? "You win the race!" : "You win!";
		} else if (isPlayable && !Builder.isBuilding) {
			playStatus.textContent = raceEnabled
				? "Use arrow keys to race the AI"
				: "Use arrow keys to play";
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

	const beginRaceIfNeeded = () => {
		if (!raceEnabled || raceStarted || !isPlayable || Builder.isBuilding) return;
		agent.setDifficulty(document.getElementById("difficultySelect")?.value || "medium");
		agent.reset(startNode);
		agent.startRace(MyMaze, endNode);
		raceStarted = true;
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
					agentWon = false;
					raceStarted = false;
					player.reset(startNode);
					agent.reset(startNode);
					resetTimers();
					updatePlayStatus();
				}
			}
		});

		const solveBtn = document.getElementById("solveButton");
		solveBtn.addEventListener("click", () => {
			if (!Builder.isBuilding) {
				if (Builder.cellStack.length > 0) {
					const startingSolve = !Solver_AStar.isSolving;
					Solver_AStar.isSolving = !Solver_AStar.isSolving;
					if (startingSolve && Solver_AStar.isSolving) {
						solverTimerStart = performance.now();
						solverTimerElapsedMs = 0;
						solverTimerRunning = true;
						wasSolverRunning = true;
						updateTimerDisplays();
					}
				}
			}
		});

		const resetBtn = document.getElementById("resetButton");
		resetBtn.addEventListener("click", () => {
			resetMaze();
		});

		const raceToggle = document.getElementById("raceToggle");
		const difficultySelect = document.getElementById("difficultySelect");
		raceToggle.addEventListener("change", () => {
			raceEnabled = raceToggle.checked;
			difficultySelect.disabled = !raceEnabled;
			if (!raceEnabled) {
				raceStarted = false;
				agentWon = false;
				agent.reset(startNode);
			} else {
				agent.setDifficulty(difficultySelect.value);
			}
			updatePlayStatus();
		});
		difficultySelect.addEventListener("change", () => {
			agent.setDifficulty(difficultySelect.value);
			if (raceEnabled && !raceStarted) {
				agent.reset(startNode);
			}
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

		if (wasSolverRunning && !Solver_AStar.isSolving && solverTimerRunning) {
			solverTimerElapsedMs = performance.now() - solverTimerStart;
			solverTimerRunning = false;
			wasSolverRunning = false;
		}

		if (Solver_AStar.path.length > 0) {
			displaySolvePath(Solver_AStar.path);
		}

		if (hasWon && player.path.length > 1) {
			displayPlayerPath(player.path);
		}

		updateTimerDisplays();

		if (!Builder.isBuilding && MyMaze.numVisited === MyMaze.totalCells) {
			if (!isPlayable) {
				isPlayable = true;
				updatePlayStatus();
			}
		}

		if (raceStarted && !hasWon && !agentWon) {
			agent.update(sketch.deltaTime);
			if (agent.hasReachedGoal(endNode)) {
				agentWon = true;
				agent.isRacing = false;
				if (playerTimerRunning) {
					playerTimerElapsedMs = performance.now() - playerTimerStart;
					playerTimerRunning = false;
				}
				updatePlayStatus();
				updateTimerDisplays();
			}
		}

		if (isPlayable) {
			player.display(sketch, cellWidth, cellHeight);
			if (raceEnabled) {
				agent.display(sketch, cellWidth, cellHeight);
			}
		}
	}

	sketch.keyPressed = () => {
		if (!isPlayable || Builder.isBuilding || hasWon || agentWon) return;

		const isArrowKey = sketch.keyCode === 38 || sketch.keyCode === 39
			|| sketch.keyCode === 40 || sketch.keyCode === 37;
		if (!isArrowKey) return;

		if (!playerTimerRunning && playerTimerStart === null) {
			playerTimerStart = performance.now();
			playerTimerElapsedMs = 0;
			playerTimerRunning = true;
			beginRaceIfNeeded();
		}

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
			agent.isRacing = false;
			if (playerTimerRunning) {
				playerTimerElapsedMs = performance.now() - playerTimerStart;
				playerTimerRunning = false;
			}
			updatePlayStatus();
			updateTimerDisplays();
		} else if (moved) {
			updateTimerDisplays();
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
		sketch.strokeWeight(3);
		sketch.beginShape();
		for (let i = 0; i < path.length; i++) {
			sketch.vertex(path[i].posX * cellWidth + cellWidth / 2, path[i].posY * cellHeight + cellHeight / 2);
		}
		sketch.endShape();
		sketch.strokeWeight(1);
	}

	const displayPlayerPath = (path) => {
		sketch.noFill();
		sketch.stroke(sketch.color(255, 140, 0));
		sketch.strokeWeight(3);
		sketch.beginShape();
		for (let i = 0; i < path.length; i++) {
			sketch.vertex(path[i].posX * cellWidth + cellWidth / 2, path[i].posY * cellHeight + cellHeight / 2);
		}
		sketch.endShape();
		sketch.strokeWeight(1);
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
		agent = new SimpleAgent(
			startNode.posX,
			startNode.posY,
			document.getElementById("difficultySelect")?.value || "medium"
		);
		isPlayable = false;
		hasWon = false;
		agentWon = false;
		raceStarted = false;
		resetTimers();
		updatePlayStatus();

		// Calculate startNode h and f scores
		startNode.hScore = Solver_AStar.calcHScore(startNode, endNode);
		startNode.fScore = Solver_AStar.calcFScore(startNode);
	}

}

const sketch = new p5(mySketch);
