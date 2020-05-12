import { color } from 'p5'

export default class AStar_Node {
	constructor(x,y) {
		this.posX = x;
		this.posY = y;
		this.pos = [x,y];
		this.cameFrom = undefined;
		this.gScore = 0;
		this.hScore = 0;
		this.fScore = 0;
		this.color = () => color(0, 0, 0);
	}
}