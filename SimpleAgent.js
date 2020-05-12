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