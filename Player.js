export default class Player {
	constructor(posX, posY) {
		this.posX = posX;
		this.posY = posY;
	}

	reset(startNode) {
		this.posX = startNode.posX;
		this.posY = startNode.posY;
	}

	canMove(maze, dRow, dCol) {
		const nextX = this.posX + dCol;
		const nextY = this.posY + dRow;

		if (nextX < 0 || nextY < 0 || nextX >= maze.numCellsX || nextY >= maze.numCellsY) {
			return false;
		}

		const cell = maze.cells[this.posY][this.posX];
		if (dRow === -1 && dCol === 0) return cell.wallVisibility[0] === false;
		if (dRow === 0 && dCol === 1) return cell.wallVisibility[1] === false;
		if (dRow === 1 && dCol === 0) return cell.wallVisibility[2] === false;
		if (dRow === 0 && dCol === -1) return cell.wallVisibility[3] === false;
		return false;
	}

	move(maze, dRow, dCol) {
		if (!this.canMove(maze, dRow, dCol)) return false;
		this.posX += dCol;
		this.posY += dRow;
		return true;
	}

	hasReachedGoal(goalNode) {
		return this.posX === goalNode.posX && this.posY === goalNode.posY;
	}

	display(sketch, cellWidth, cellHeight) {
		sketch.noStroke();
		sketch.fill(0, 140, 186);
		sketch.ellipse(
			this.posX * cellWidth + cellWidth / 2,
			this.posY * cellHeight + cellHeight / 2,
			cellWidth / 1.5,
			cellHeight / 1.5
		);
	}
}
