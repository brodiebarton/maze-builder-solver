import Helper from './Helper';
import AStar_Node from './AStar_Node';
import {color} from 'p5';

export default class MazeSolver_AStar {
	constructor(start, goal) {
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

	calcHScore(node, endNode) {
		let h = Math.abs(node.posX - endNode.posX) + Math.abs(node.posY - endNode.posY);
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
		console.log("CALL TO MAZESOLVER_ASTAR.SHOWPATH()");
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

		// Chose node with lowest f score
		let lowestFNode = 0;
		for (let i = 0; i < this.openList.length; i++) {
			if (this.openList[i].fScore < this.openList[lowestFNode].fScore) {
				lowestFNode = i;
			}
		}
		
		this.currentNode = this.openList[lowestFNode];

		// Check if currentNode is the goal
		let isCurrentTheGoal = this.compareNodes(this.currentNode, this.goal);
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
				n.fScore = n.gScore + this.calcHScore(n, this.goal);	
			});
		}
	}

	checkNeighbors(node, maze) {
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