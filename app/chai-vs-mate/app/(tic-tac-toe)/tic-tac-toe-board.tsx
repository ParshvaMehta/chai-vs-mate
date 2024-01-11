import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Theme } from "../../constants/Colors";
import { useKeepAwake } from "expo-keep-awake";
import {
	BOT_LEVEL,
	GAME_TYPE,
	SIZE,
	findBestMove,
} from "./helper/tic-tac-toe-helper";
import { delay } from "../../constants/Utils";
import { useLocalSearchParams } from "expo-router";
import SoundService from "../../services/SoundService";

const X = "X";
const O = "O";
const MoveSound = require("../../assets/sounds/move_sound.mp3");

const TicTacToe: React.FC = () => {
	useKeepAwake();
	// Create a reference to the sound
	const [board, setBoard] = useState<string[][]>(
		Array(SIZE).fill(Array(SIZE).fill(null))
	);
	const local = useLocalSearchParams();
	const { gameType } = local;
	const isSinglePlayer = useMemo(
		() => gameType === GAME_TYPE.SINGLE_PLAYER,
		[gameType]
	);
	const [isPlayerX, setIsPlayerX] = useState<boolean>(Boolean(Date.now() % 2));
	const [winner, setWinner] = useState<string | null>(null);
	const [botLevel, setBotLevel] = useState<string>(
		Boolean(Date.now() % 2) ? BOT_LEVEL.EASY : BOT_LEVEL.HARD
	);

	const player1 = useMemo(() => {
		return isSinglePlayer ? "You" : "Player 1";
	}, [isSinglePlayer]);

	const player2 = useMemo(() => {
		return isSinglePlayer ? "Computer" : "Player 2";
	}, [isSinglePlayer]);

	const makeBotMove = async () => {
		if (winner || !isSinglePlayer) {
			return;
		}
		await delay(300);
		if (botLevel === BOT_LEVEL.EASY) {
			makeEasyBotMove();
			return;
		}
		makeHardBotMove();
		return;
	};
	const makeHardBotMove = async () => {
		const bestMove = await findBestMove(board);
		await handleClick(bestMove.row, bestMove.col);
	};
	const makeEasyBotMove = () => {
		const emptyCells = getEmptyCells();
		const randomIndex = Math.floor(Math.random() * emptyCells.length);
		const randomCell = emptyCells[randomIndex];
		handleClick(randomCell[0], randomCell[1]);
	};
	const getEmptyCells = () => {
		const emptyCells: number[][] = [];
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				if (!board[i][j]) {
					emptyCells.push([i, j]);
				}
			}
		}
		return emptyCells;
	};
	useEffect(() => {
		checkWinner();
	}, [board]);

	useEffect(() => {
		if (!isPlayerX) {
			makeBotMove();
		}
	}, [isPlayerX]);

	useEffect(() => {
		SoundService.loadSoundAsync(MoveSound);
		return () => {
			SoundService.unloadSoundAsync();
		};
	}, []);

	const checkWinner = () => {
		for (let i = 0; i < SIZE; i++) {
			// Check rows
			if (
				board[i][0] === board[i][1] &&
				board[i][1] === board[i][2] &&
				board[i][0] !== null
			) {
				setWinner(board[i][0]);
				return;
			}
			// Check columns
			if (
				board[0][i] === board[1][i] &&
				board[1][i] === board[2][i] &&
				board[0][i] !== null
			) {
				setWinner(board[0][i]);
				return;
			}
		}

		// Check diagonals
		if (
			board[0][0] === board[1][1] &&
			board[1][1] === board[2][2] &&
			board[0][0] !== null
		) {
			setWinner(board[0][0]);
			return;
		}

		if (
			board[0][2] === board[1][1] &&
			board[1][1] === board[2][0] &&
			board[0][2] !== null
		) {
			setWinner(board[0][2]);
		}
	};

	const handleClick = async (row: number, col: number) => {
		if (board[row][col] || winner) {
			return; // Cell already filled or game over
		}
		SoundService.playSoundAsync();
		const newBoard = board.map((r, i) =>
			r.map((c, j) => (i === row && j === col ? (isPlayerX ? X : O) : c))
		);

		setBoard(newBoard);
		setIsPlayerX(!isPlayerX);
		// console.log(newBoard.flat().filter((b) => !!b).length);
	};

	const renderCell = (row: number, col: number) => {
		const cellValue = board[row][col]?.toUpperCase();
		const newStyle =
			cellValue === X
				? {
						backgroundColor: Theme.color.info[200],
				  }
				: cellValue === O
				? {
						backgroundColor: Theme.color.danger[200],
				  }
				: {
						backgroundColor: "transparent",
				  };
		const cellStyle = [
			styles.cell,
			{
				...newStyle,
			},
		];
		const newTextStyle =
			cellValue === X
				? {
						color: Theme.color.info[650],
				  }
				: cellValue === O
				? {
						color: Theme.color.danger[550],
				  }
				: {
						color: "transparent",
				  };
		const cellTextStyle = [styles.cellText, { ...newTextStyle }];

		return (
			<TouchableOpacity
				key={`${row}-${col}`}
				style={cellStyle}
				onPress={() => handleClick(row, col)}
				activeOpacity={0.8}
				disabled={!!cellValue || !!winner}
			>
				<Text style={cellTextStyle}>{cellValue}</Text>
			</TouchableOpacity>
		);
	};

	const renderBoard = () => (
		<View style={styles.board}>
			{board.map((row, i) => (
				<View key={i} style={styles.row}>
					{row.map((_col, j) => renderCell(i, j))}
				</View>
			))}
		</View>
	);

	const resetGame = () => {
		setBoard(Array(SIZE).fill(Array(SIZE).fill(null)));
		setIsPlayerX(Boolean(Date.now() % 2));
		setWinner(null);
		setBotLevel(Boolean(Date.now() % 2) ? BOT_LEVEL.EASY : BOT_LEVEL.HARD);
	};

	return (
		<View style={styles.container}>
			<View>
				<Text
					style={{
						...styles.player,
						transform: [{ rotate: isSinglePlayer ? "0deg" : "180deg" }],
						fontWeight: isPlayerX ? "300" : "600",
						color: isPlayerX
							? Theme.color.secondary[700]
							: Theme.color.danger[550],
					}}
				>
					{`${player2} (${O})`}{" "}
					{isSinglePlayer && (
						<Text
							style={{
								fontSize: 16,
							}}
						>
							{botLevel}
						</Text>
					)}
				</Text>
			</View>
			{renderBoard()}
			{winner && <Text style={styles.winnerText}>{`Winner: ${winner}`}</Text>}
			<TouchableOpacity style={styles.resetButton} onPress={resetGame}>
				<Text style={styles.resetButtonText}>Reset Game</Text>
			</TouchableOpacity>
			<View>
				<Text
					style={{
						...styles.player,
						fontWeight: isPlayerX ? "600" : "300",
						color: isPlayerX
							? Theme.color.info[650]
							: Theme.color.secondary[700],
					}}
				>{`${player1} (${X})`}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Theme.color.primary[150],
	},
	board: {
		flexDirection: "column",
		paddingVertical: 50,
	},
	row: {
		flexDirection: "row",
	},
	cell: {
		width: 80,
		height: 80,
		borderWidth: 1,
		borderColor: Theme.color.primary[400],
		justifyContent: "center",
		alignItems: "center",
	},
	cellText: {
		fontSize: 36,
		fontWeight: "900",
	},
	winnerText: {
		fontSize: 20,
		fontWeight: "bold",
		marginVertical: 16,
		color: "green",
	},
	resetButton: {
		backgroundColor: "#2ecc71", // Customize the background color
		padding: 10,
		borderRadius: 8,
		marginTop: 16,
	},
	resetButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	player: {
		fontSize: 40,
		color: Theme.color.secondary[700],
		margin: 20,
	},
});

export default TicTacToe;
