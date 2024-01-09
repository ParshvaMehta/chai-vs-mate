export enum GAME_TYPE {
	SINGLE_PLAYER = "SINGLE_PLAYER",
	MULTI_PLAYER = "MULTI_PLAYER",
	ONLINE = "ONLINE",
}
export const SIZE = 3;
export const findBestMove = (board: string[][]) => {
	let bestVal = -Infinity;
	let bestMove = { row: -1, col: -1 };

	for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
			if (board[i][j] === null) {
				board[i][j] = "O";
				let moveVal = minimax(board, 0, false);
				board[i][j] = null;

				if (moveVal > bestVal) {
					bestMove = { row: i, col: j };
					bestVal = moveVal;
				}
			}
		}
	}

	return bestMove;
};

const minimax = (board: string[][], depth: number, isMaximizing: boolean) => {
	const score = evaluate(board);

	if (score === 10 || score === -10) {
		return score;
	}

	if (isMovesLeft(board) === false) {
		return 0;
	}

	if (isMaximizing) {
		let best = -Infinity;
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				if (board[i][j] === null) {
					board[i][j] = "O";
					best = Math.max(best, minimax(board, depth + 1, !isMaximizing));
					board[i][j] = null;
				}
			}
		}
		return best;
	} else {
		let best = Infinity;
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				if (board[i][j] === null) {
					board[i][j] = "X";
					best = Math.min(best, minimax(board, depth + 1, !isMaximizing));
					board[i][j] = null;
				}
			}
		}
		return best;
	}
};

const evaluate = (board: string[][]) => {
	for (let row = 0; row < SIZE; row++) {
		if (
			board[row][0] === board[row][1] &&
			board[row][1] === board[row][2] &&
			board[row][0] !== null
		) {
			return board[row][0] === "O" ? 10 : -10;
		}
	}

	for (let col = 0; col < SIZE; col++) {
		if (
			board[0][col] === board[1][col] &&
			board[1][col] === board[2][col] &&
			board[0][col] !== null
		) {
			return board[0][col] === "O" ? 10 : -10;
		}
	}

	if (
		board[0][0] === board[1][1] &&
		board[1][1] === board[2][2] &&
		board[0][0] !== null
	) {
		return board[0][0] === "O" ? 10 : -10;
	}

	if (
		board[0][2] === board[1][1] &&
		board[1][1] === board[2][0] &&
		board[0][2] !== null
	) {
		return board[0][2] === "O" ? 10 : -10;
	}

	return 0;
};

const isMovesLeft = (board: string[][]) => {
	for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
			if (board[i][j] === null) {
				return true;
			}
		}
	}
	return false;
};
