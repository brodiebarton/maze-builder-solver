export default class Helper {
	static removeFromArray(arr, t) {
		for (let i = arr.length - 1; i >= 0; i--) {
			if (arr[i] == t) {
				arr.splice(i,1);
			}
		}
	}
}