import { off, onValue, ref, update } from "firebase/database";
import React, { useEffect, useState, useMemo, useContext } from "react";
import {
	View,
	Text,
	Alert,
	ScrollView,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { FIREBASE_DB } from "../../constants/FireBaseConfig";
import { SequenceGame, GameStatus, Suit, CoinEnum } from "./helpers/types";
import Card from "./components/Card";
import Coin from "./components/Coin";
import { getCardsForPlayers, hasSequence } from "./helpers/SequenceHelper";
import { useNavigation } from "@react-navigation/native";
import { Theme } from "../../constants/Colors";
import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams } from "expo-router";
import { AuthContext } from "../../contexts/AuthContexts";
import SoundService from "../../services/SoundService";
const MoveSound = require("../../assets/sounds/move_sound.mp3");

export function SequenceBoard() {
	useKeepAwake();
	const navigation = useNavigation();
	const local = useLocalSearchParams();
	const { gameUUID } = local;
	const dbId = `games/sequence/${gameUUID}`;
	const { user } = useContext(AuthContext);
	const gameRef = ref(FIREBASE_DB, dbId);
	const [gameData, setGameData] = useState<SequenceGame>();
	const board = useMemo(() => gameData?.board, [gameData]);
	const [selectedCard, setSelectedCard] = useState<string>("");
	const canDiscard = useMemo(() => {
		if (!gameData || !gameData.board || !selectedCard) {
			return false;
		}
		return (
			gameData.board.flat().filter(({ card, coin }) => {
				return coin && selectedCard === card;
			}).length === 2
		);
	}, [selectedCard]);
	const player = useMemo(() => {
		if (!gameData) {
			return {};
		}
		const { players = [] } = gameData;
		return players.find((p) => p?.uid === user?.uid);
	}, [gameData]);
	const isMyTurn = useMemo(() => {
		if (!gameData) {
			return false;
		}
		const { turn_idx = -1, players } = gameData;
		return players[turn_idx]?.uid === user?.uid;
	}, [gameData]);
	useEffect(() => {
		onValue(gameRef, async (snapshot) => {
			const data = snapshot.val() as SequenceGame;
			await setGameData(data);
		});
	}, [user, gameUUID]);
	useEffect(() => {
		SoundService.loadSoundAsync(MoveSound);
		return () => {
			SoundService.unloadSoundAsync();
		};
	}, []);

	const handleMyCardPress = (
		suit: string,
		value: string,
		_coin: string,
		_row: number,
		_col: number,
		_disable: boolean
	) => {
		setSelectedCard([value, suit].join("-"));
	};

	const discardMyCard = async (
		suit: string,
		value: string | number,
		coin: string,
		_row: number,
		_col: number,
		disable: boolean
	) => {
		const card = [value, suit].join("-");
		if (!isMyTurn || disable || coin || card !== selectedCard) {
			return;
		}
		const { deck, players, turn_idx } = gameData;
		const newCard = deck.pop() as string;
		const cardIdx = players[turn_idx].my_cards.findIndex((c) => c === card);
		players[turn_idx].my_cards.splice(cardIdx, 1);
		players[turn_idx].my_cards.push(newCard);
		await update(gameRef, {
			players,
			deck,
		});
	};

	const onBoardCardPress = async (
		suit: string,
		value: string | number,
		coin: string,
		row: number,
		col: number,
		disable: boolean
	) => {
		try {
			// validate your turn
			if (!isMyTurn) {
				return;
			}

			const card = `${value}-${suit}`;
			let newGame = {};
			Object.assign(newGame, gameData);
			let {
				game_status,
				deck,
				board,
				players,
				turn_idx,
				next_turn_idx,
				completed_sequence,
				winning_sequence,
				winner,
			} = newGame as SequenceGame;

			// check if the game is completed or not.
			if (game_status === GameStatus.COMPLETED) {
				Alert.alert("oops!", `Game Over!`);
				return;
			}
			// if deck is empty then need to reshuffle the deck
			if (!deck || deck.length === 0) {
				console.info("Existing Deck is Empty, reshuffle the deck");
				deck = getCardsForPlayers(2, 0, 0).deck;
			}
			const myCard = player?.my_cards;
			if (!myCard) {
				console.info("My Card not found in Database");
				return;
			}

			let cardIndex = myCard.indexOf(card);
			const twoEyeJackIndex =
				myCard.indexOf("J-C") < 0
					? myCard.indexOf("J-D")
					: myCard.indexOf("J-C");
			const oneEyeJackIndex =
				myCard.indexOf("J-H") < 0
					? myCard.indexOf("J-S")
					: myCard.indexOf("J-H");

			if (cardIndex < 0) {
				console.info(
					`card %s is not in deck of user %s , going to check if player have 2eye Jack`,
					card,
					user.displayName
				);

				// find if have two eye or one eye jack
				cardIndex = !coin ? twoEyeJackIndex : oneEyeJackIndex;
				if (cardIndex < 0) {
					Alert.alert("oops!", `Please check your cards!! it's not your card!`);
					return;
				}
			}

			// check is that position have any full sequence and it's not own coin
			const isAllowToRemoveCoin = !disable && coin !== player?.team;
			if (coin && !isAllowToRemoveCoin) {
				Alert.alert("oops!", `Not allowed to put / remove coin here!!`);
				return;
			}

			let newCoin = player?.team;
			if (oneEyeJackIndex >= 0 && coin && isAllowToRemoveCoin) {
				cardIndex = oneEyeJackIndex;
				newCoin = "";
			}

			board[row][col].coin = newCoin as CoinEnum;
			players[turn_idx].my_cards?.splice(cardIndex, 1);
			// if player has removed the card , then no meaning of checking sequence
			if (newCoin !== "") {
				const { sequences: newSequence, board: newBoard } = await hasSequence(
					board,
					row,
					col,
					player?.team as CoinEnum
				);
				if (newSequence > 0) {
					if (!completed_sequence) {
						completed_sequence = {
							R: 0,
							G: 0,
							B: 0,
						};
					}
					completed_sequence[player?.team]++;
					if (completed_sequence[player?.team] >= winning_sequence) {
						game_status = GameStatus.COMPLETED;
						winner = player?.team;
					}
				}
			}
			const newCard = deck.pop() as string;
			players[turn_idx].my_cards.push(newCard);
			const number_of_players = players.length;
			turn_idx = next_turn_idx;
			next_turn_idx =
				next_turn_idx + 1 >= number_of_players ? 0 : next_turn_idx + 1;
			// console.debug(
			//     JSON.stringify({
			//         game_status,
			//         deck,
			//         board,
			//         players,
			//         turn_idx,
			//         next_turn_idx,
			//         completed_sequence,
			//         winning_sequence
			//     })
			// );
			// return;
			SoundService.playSoundAsync();
			await update(gameRef, {
				game_status,
				players,
				deck,
				winning_sequence,
				board,
				turn_idx,
				next_turn_idx,
				winner,
				completed_sequence,
			});
		} catch (e) {
			console.error(e);
		} finally {
			setSelectedCard("");
		}
	};
	const renderTurn = (title = "", index: number = -1, size = 15) => {
		const turnPlayer = gameData?.players[index];
		const isYou = turnPlayer?.uid === user?.uid;
		if (!turnPlayer) {
			return <></>;
		}
		return (
			<Text
				key={`player_render_${index}`}
				style={{
					fontSize: size,
					justifyContent: "center",
					color: Theme.color.primary[500],
				}}
			>
				{title && (
					<Text
						style={{
							fontWeight: "bold",
							fontSize: size,
							fontFamily: "Nunito_500Medium",
						}}
					>
						{title} :{" "}
					</Text>
				)}
				{turnPlayer?.team && <Coin team={turnPlayer?.team} size={size} />}
				{!isYou && (turnPlayer.displayName || turnPlayer.email)}
				{isYou && "You"}
			</Text>
		);
	};
	const renderWinner = (winnerTeam: string = "") => {
		if (!gameData || !winnerTeam) {
			return "";
		}
		const { players } = gameData;
		const winners = players
			.map((p, i) => (p.team === winnerTeam ? i.toString() : undefined))
			.filter((x) => x);
		return (
			<>
				{winners?.map((w) => renderTurn("", parseInt(w?.toString() || ""), 30))}
			</>
		);
	};

	const renderBoard = useMemo(() => {
		return (
			<View
				key={"sequence_board"}
				style={{
					width: "100%",
					flex: 1,
					flexDirection: "column",
					gap: 1,
				}}
			>
				{board?.map((rows, rowIdx) => {
					return (
						<View
							key={`board_${rowIdx}`}
							style={{
								flex: 1,
								flexDirection: "row",
							}}
						>
							{rows?.map((cols, colIdx) => {
								const [rank, suit] = cols.card.split("-");
								return (
									<View
										key={`board_${rowIdx}_${colIdx}`}
										style={{
											flex: 1,
											flexDirection: "column",
										}}
									>
										<Card
											key={`card_${cols.row}_${cols.col}`}
											rank={rank}
											suit={suit as Suit}
											coin={cols.coin}
											onPress={onBoardCardPress}
											row={cols.row}
											col={cols.col}
											disable={cols.disable}
											isSelected={cols.card === selectedCard}
										/>
									</View>
								);
							})}
						</View>
					);
				})}
			</View>
		);
	}, [board, selectedCard]);

	const renderContent = () => {
		if (!gameData) {
			return (
				<View>
					<ActivityIndicator />
				</View>
			);
		}
		if (gameData.game_status === GameStatus.COMPLETED) {
			return (
				<View style={styles.container}>
					<Text style={styles.gameOverText}>Game Over!</Text>
					<Text style={{ fontSize: 24, fontFamily: "Nunito_500Medium" }}>
						{" "}
						Winner :{" "}
					</Text>
					<View>{renderWinner(gameData?.winner)}</View>
					<TouchableOpacity
						style={styles.button}
						onPress={() => navigation.navigate("sequence-landing")}
					>
						<Text style={styles.buttonText}>Let's Play Again!</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<View style={styles.container}>
				<View style={styles.turn}>
					{renderTurn("Turn", gameData?.turn_idx)}
					{renderTurn("Next", gameData?.next_turn_idx)}
				</View>
				<ScrollView contentContainerStyle={styles.board}>
					{renderBoard}
				</ScrollView>
				<View style={styles.myCardContainer}>
					{player?.team && (
						<View
							style={{
								alignContent: "center",
								height: "auto",
								justifyContent: "center",
							}}
						>
							<Coin team={player?.team} size={36} />
						</View>
					)}
					{player?.my_cards?.map((c, i) => {
						const [rank, suit] = c.split("-");
						return (
							<View
								style={styles.myCard}
								key={`my_card_view_${rank}_${suit}_${i}`}
							>
								<Card
									key={`my_card_${rank}_${suit}_${i}`}
									suit={suit as Suit}
									rank={rank}
									onPress={handleMyCardPress}
									canDiscard={selectedCard === c && canDiscard}
									onDiscardPress={discardMyCard}
								/>
							</View>
						);
					})}
				</View>
			</View>
		);
	};
	return <>{renderContent()}</>;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 12,
		backgroundColor: Theme.color.secondary[300],
		width: "100%",
		gap: 0,
		color: "white",
	},
	turn: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
		color: "white",
	},
	board: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 4,
		padding: 5,
		color: "white",
	},
	myCard: {
		position: "relative",
		flex: 1,
	},
	myCardContainer: {
		width: "100%",
		height: "auto",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		justifyContent: "center",
		alignContent: "center",
		padding: 10,
	},
	gameOverText: {
		fontSize: 50,
		color: Theme.color.primary.DEFAULT,
		fontFamily: "Nunito_500Medium",
	},
	button: {
		marginTop: 100,
		backgroundColor: Theme.color.primary[750],
		padding: 16,
		borderRadius: 8,
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
	},
	buttonText: {
		color: Theme.color.primary[150],
		fontSize: 24,
		fontFamily: "Nunito_500Medium",
		width: "100%",
		textAlign: "center",
	},
});

export default SequenceBoard;
