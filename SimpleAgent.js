const DIFFICULTY_SETTINGS = {
	easy: { moveIntervalMs: 420, strategy: "wander" },
	medium: { moveIntervalMs: 280, strategy: "wallFollow" },
	hard: { moveIntervalMs: 160, strategy: "shortest" },
	extreme: { moveIntervalMs: 100, strategy: "shortest" },
};

export default class SimpleAgent {
	constructor(posX, posY, difficulty = "medium") {
		this.posX = posX;
		this.posY = posY;
		this.difficulty = difficulty;
		this.color = [220, 70, 70];
		this.path = [];
		this.pathIndex = 0;
		this.accumulatorMs = 0;
		this.hasFinished = false;
		this.isRacing = false;
		this.facing = 1; // 0 up, 1 right, 2 down, 3 left
	}

	setDifficulty(difficulty) {
		if (DIFFICULTY_SETTINGS[difficulty]) {
			this.difficulty = difficulty;
		}
	}

	reset(startNode) {
		this.posX = startNode.posX;
		this.posY = startNode.posY;
		this.path = [];
		this.pathIndex = 0;
		this.accumulatorMs = 0;
		this.hasFinished = false;
		this.isRacing = false;
		this.facing = 1;
	}

	startRace(maze, endNode) {
		this.isRacing = true;
		this.hasFinished = false;
		this.accumulatorMs = 0;
		this.path = this.buildPath(maze, endNode);
		this.pathIndex = 0;
		if (this.path.length > 0) {
			this.posX = this.path[0].posX;
			this.posY = this.path[0].posY;
		}
	}

	buildPath(maze, endNode) {
		const settings = DIFFICULTY_SETTINGS[this.difficulty] || DIFFICULTY_SETTINGS.medium;
		if (settings.strategy === "wander") {
			return this.buildWanderPath(maze, endNode);
		}
		if (settings.strategy === "wallFollow") {
			return this.buildWallFollowPath(maze, endNode);
		}
		return this.buildShortestPath(maze, endNode);
	}

	buildShortestPath(maze, endNode) {
		const start = { posX: this.posX, posY: this.posY };
		const key = (x, y) => `${x},${y}`;
		const queue = [start];
		const cameFrom = new Map();
		cameFrom.set(key(start.posX, start.posY), null);

		while (queue.length > 0) {
			const current = queue.shift();
			if (current.posX === endNode.posX && current.posY === endNode.posY) {
				return this.reconstructPath(cameFrom, current);
			}

			for (const next of this.getOpenNeighbors(maze, current.posX, current.posY)) {
				const nextKey = key(next.posX, next.posY);
				if (cameFrom.has(nextKey)) continue;
				cameFrom.set(nextKey, current);
				queue.push(next);
			}
		}

		return [start];
	}

	buildWallFollowPath(maze, endNode) {
		const path = [{ posX: this.posX, posY: this.posY }];
		let x = this.posX;
		let y = this.posY;
		let facing = this.facing;
		const visitedTurns = new Set();
		const maxSteps = maze.totalCells * 8;

		for (let step = 0; step < maxSteps; step++) {
			if (x === endNode.posX && y === endNode.posY) break;

			const left = (facing + 3) % 4;
			const deltas = [
				{ dRow: -1, dCol: 0 },
				{ dRow: 0, dCol: 1 },
				{ dRow: 1, dCol: 0 },
				{ dRow: 0, dCol: -1 },
			];

			let moved = false;
			for (const turn of [left, facing, (facing + 1) % 4, (facing + 2) % 4]) {
				const delta = deltas[turn];
				if (this.canMove(maze, x, y, delta.dRow, delta.dCol)) {
					x += delta.dCol;
					y += delta.dRow;
					facing = turn;
					path.push({ posX: x, posY: y });
					moved = true;
					break;
				}
			}

			if (!moved) break;

			const marker = `${x},${y},${facing}`;
			if (visitedTurns.has(marker) && path.length > maze.totalCells) break;
			visitedTurns.add(marker);
		}

		if (path[path.length - 1].posX !== endNode.posX || path[path.length - 1].posY !== endNode.posY) {
			return this.buildShortestPath(maze, endNode);
		}
		return path;
	}

	buildWanderPath(maze, endNode) {
		const shortest = this.buildShortestPath(maze, endNode);
		const path = [{ posX: this.posX, posY: this.posY }];
		let x = this.posX;
		let y = this.posY;
		const maxSteps = Math.max(shortest.length * 3, maze.totalCells);

		for (let step = 0; step < maxSteps; step++) {
			if (x === endNode.posX && y === endNode.posY) break;

			const neighbors = this.getOpenNeighbors(maze, x, y);
			if (neighbors.length === 0) break;

			let next;
			if (Math.random() < 0.55) {
				neighbors.sort((a, b) => {
					const da = Math.abs(a.posX - endNode.posX) + Math.abs(a.posY - endNode.posY);
					const db = Math.abs(b.posX - endNode.posX) + Math.abs(b.posY - endNode.posY);
					return da - db;
				});
				next = neighbors[0];
			} else {
				next = neighbors[Math.floor(Math.random() * neighbors.length)];
			}

			x = next.posX;
			y = next.posY;
			path.push({ posX: x, posY: y });
		}

		if (path[path.length - 1].posX !== endNode.posX || path[path.length - 1].posY !== endNode.posY) {
			const finish = this.buildShortestPathFrom(maze, { posX: x, posY: y }, endNode);
			return path.concat(finish.slice(1));
		}
		return path;
	}

	buildShortestPathFrom(maze, start, endNode) {
		const savedX = this.posX;
		const savedY = this.posY;
		this.posX = start.posX;
		this.posY = start.posY;
		const path = this.buildShortestPath(maze, endNode);
		this.posX = savedX;
		this.posY = savedY;
		return path;
	}

	reconstructPath(cameFrom, end) {
		const key = (node) => `${node.posX},${node.posY}`;
		const path = [];
		let current = end;
		while (current) {
			path.push({ posX: current.posX, posY: current.posY });
			current = cameFrom.get(key(current));
		}
		path.reverse();
		return path;
	}

	getOpenNeighbors(maze, posX, posY) {
		const neighbors = [];
		const deltas = [
			{ dRow: -1, dCol: 0 },
			{ dRow: 0, dCol: 1 },
			{ dRow: 1, dCol: 0 },
			{ dRow: 0, dCol: -1 },
		];
		for (const delta of deltas) {
			if (this.canMove(maze, posX, posY, delta.dRow, delta.dCol)) {
				neighbors.push({ posX: posX + delta.dCol, posY: posY + delta.dRow });
			}
		}
		return neighbors;
	}

	canMove(maze, posX, posY, dRow, dCol) {
		const nextX = posX + dCol;
		const nextY = posY + dRow;
		if (nextX < 0 || nextY < 0 || nextX >= maze.numCellsX || nextY >= maze.numCellsY) {
			return false;
		}
		const cell = maze.cells[posY][posX];
		if (dRow === -1 && dCol === 0) return cell.wallVisibility[0] === false;
		if (dRow === 0 && dCol === 1) return cell.wallVisibility[1] === false;
		if (dRow === 1 && dCol === 0) return cell.wallVisibility[2] === false;
		if (dRow === 0 && dCol === -1) return cell.wallVisibility[3] === false;
		return false;
	}

	update(deltaMs) {
		if (!this.isRacing || this.hasFinished || this.path.length === 0) return false;

		const settings = DIFFICULTY_SETTINGS[this.difficulty] || DIFFICULTY_SETTINGS.medium;
		this.accumulatorMs += deltaMs;

		let moved = false;
		while (this.accumulatorMs >= settings.moveIntervalMs && !this.hasFinished) {
			this.accumulatorMs -= settings.moveIntervalMs;
			if (this.pathIndex < this.path.length - 1) {
				this.pathIndex += 1;
				this.posX = this.path[this.pathIndex].posX;
				this.posY = this.path[this.pathIndex].posY;
				moved = true;
			}
			if (this.pathIndex >= this.path.length - 1) {
				this.hasFinished = true;
				this.isRacing = false;
			}
		}
		return moved;
	}

	hasReachedGoal(goalNode) {
		return this.posX === goalNode.posX && this.posY === goalNode.posY;
	}

	display(sketch, cellWidth, cellHeight) {
		sketch.noStroke();
		sketch.fill(this.color[0], this.color[1], this.color[2]);
		sketch.ellipse(
			this.posX * cellWidth + cellWidth / 2,
			this.posY * cellHeight + cellHeight / 2,
			cellWidth / 1.5,
			cellHeight / 1.5
		);
	}
}
