import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Clipboard,
	FlatList,
	Alert,
	ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { ref, update, onValue, off } from "firebase/database";
import { FIREBASE_DB } from "../../constants/FireBaseConfig";
import { GameStatus, Player, SequenceGame } from "./helpers/types";
import {
	getCardsForPlayers,
	getNumberOfCardForPlayer,
	getNumberOfWinningSequence,
	getTeam,
	rawBoard,
} from "./helpers/SequenceHelper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Theme } from "../../constants/Colors";
import { AuthContext } from "../../contexts/AuthContexts";

const SequenceWaitingArea: React.FC = () => {
	const navigation = useNavigation();
	console.info(navigation);
	const waitingAreaRef = useRef<boolean>(false);
	const beforeRemoveRef = useRef<boolean>(false);
	const { user } = useContext(AuthContext);
	const local = useLocalSearchParams();
	const { gameUUID } = local;
	const [gameData, setGameData] = useState<SequenceGame | null>(null);
	const dbId = useMemo(() => `games/sequence/${gameUUID}`, [gameUUID]);
	const number_of_players: number = useMemo(
		() => gameData?.players?.length || 0,
		[gameData]
	);
	const gameRef = ref(FIREBASE_DB, dbId);
	useMemo(() => {
		if (
			!user ||
			!gameData ||
			!gameData.players ||
			gameData?.game_status === GameStatus.INPROGRESS ||
			gameData?.game_status === GameStatus.COMPLETED ||
			beforeRemoveRef.current
		) {
			return;
		}
		if (gameData.game_status === GameStatus.CREATED) {
			navigation.addListener("beforeRemove", async (e) => {
				waitingAreaRef.current = true;
				beforeRemoveRef.current = true;
				e.preventDefault();
				const updatedPlayers = (gameData?.players || []).filter(
					(player) => player.uid !== user.uid
				);
				await update(gameRef, { players: updatedPlayers });
				try {
					navigation.dispatch(e.data.action);
				} catch (e) {
					console.error(e);
				}
			});
		}
		return;
	}, [user, gameData]);
	const updateOnlineStatus = async (players: Player[] = []) => {
		if (
			waitingAreaRef.current &&
			gameData?.game_status !== GameStatus.CREATED
		) {
			return;
		}
		const { uid, displayName } = user;
		const isCurrentPlayerOnline = players?.filter(
			(player) => player?.uid === uid
		);
		if (isCurrentPlayerOnline && isCurrentPlayerOnline?.length > 0) {
			return;
		}

		const newPlayers: Player[] = players || [];
		newPlayers.push({
			uid,
			displayName,
		});
		try {
			update(gameRef, {
				players: newPlayers,
			})
				.then(() => {
					waitingAreaRef.current = true;
				})
				.catch(console.error);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		onValue(gameRef, async (snapshot) => {
			const data = snapshot.val() as SequenceGame;
			if (data?.game_status === GameStatus.COMPLETED) {
				navigation.navigate("SequenceBoard", { gameUUID });
				return;
			}
			if (data?.game_status === GameStatus.INPROGRESS) {
				const currentUserInGame = data?.players?.some(
					(player) => player.uid === user.uid
				);
				if (!currentUserInGame) {
					Alert.alert(
						"Unauthorized!",
						"You are not part of this game, please check the game id"
					);
					navigation.navigate("/(sequence)/index");
					return;
				}

				navigation.navigate("SequenceBoard", { gameUUID });
				return;
			}
			await setGameData(data);
			if (data?.game_status === GameStatus.CREATED) {
				await updateOnlineStatus(data?.players);
			}
		});
		return () => {
			off(gameRef, "value");
		};
	}, [user, gameUUID]);

	const handleCopyUUID = () => {
		Clipboard.setString(gameUUID?.toString());
		// Show a notification or some feedback to the user that the UUID has been copied
	};

	const handleStartGame = async () => {
		if (!gameData) {
			return;
		}
		const game_status = GameStatus.INPROGRESS;
		const number_of_cards_to_each_player: number =
			getNumberOfCardForPlayer(number_of_players);
		const { cards, deck } = getCardsForPlayers(
			2,
			number_of_cards_to_each_player,
			number_of_players
		);
		const newPlayers = await getTeam(
			gameData.players,
			number_of_players,
			cards
		);
		const winning_sequence: number =
			getNumberOfWinningSequence(number_of_players);
		const turn_idx: number = Math.floor(Math.random() * number_of_players);
		const next_turn_idx: number =
			turn_idx + 1 >= number_of_players ? 0 : turn_idx + 1;
		// const finalGame: SequenceGame = {
		//     ...gameData,
		//     game_status,
		//     players: newPlayers,
		//     deck,
		//     winning_sequence,
		//     board: rawBoard as any,
		//     turn_idx,
		//     next_turn_idx
		// };
		// console.debug(rawBoard);
		try {
			await update(gameRef, {
				game_status,
				players: newPlayers,
				deck,
				winning_sequence,
				board: rawBoard as any,
				turn_idx,
				next_turn_idx,
			});
			waitingAreaRef.current = true;
			navigation.navigate("SequenceBoard", { gameUUID });
		} catch (e) {
			console.error(e);
		}
	};

	const loader = (
		<>
			<ActivityIndicator size={"small"} color={Theme.color.primary[500]} />{" "}
		</>
	);

	const startGameButton = () => {
		if (user?.uid !== gameData?.host?.uid) {
			return (
				<Text style={styles.waitingText}>
					{loader}
					Waiting for host to start the game...
				</Text>
			);
		}
		const canStartGame =
			number_of_players &&
			(number_of_players % 2 === 0 || number_of_players % 3 == 0);
		if (!canStartGame) {
			return (
				<Text style={styles.waitingText}>
					{loader}
					Waiting for players to join the game...
				</Text>
			);
		}
		return (
			<TouchableOpacity style={styles.button} onPress={handleStartGame}>
				<Text style={styles.buttonText}>Start Game</Text>
			</TouchableOpacity>
		);
	};

	const renderPlayerItem = ({ item }) => {
		if (!item) {
			return <></>;
		}
		return (
			<View style={styles.playerItem}>
				<Text style={styles.playerName}>
					{" "}
					<Ionicons
						name="radio-button-on-outline"
						size={16}
						color={Theme.color.success[700]}
					/>{" "}
					{item?.displayName}
				</Text>
				{item?.uid === gameData?.host?.uid && (
					<Text style={styles.hostBadge}>(Host)</Text>
				)}
			</View>
		);
	};

	const renderUUID = (
		<View style={styles.uuidContainer}>
			<Text style={styles.uuid}>
				<Ionicons name="pricetag-outline" size={20} /> {gameUUID}
			</Text>
			<TouchableOpacity onPress={handleCopyUUID}>
				<FontAwesome
					name="copy"
					size={20}
					color={Theme.color.primary.DEFAULT}
				/>
			</TouchableOpacity>
		</View>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Waiting Zone</Text>
			{renderUUID}
			{gameData?.players?.length && (
				<FlatList
					data={gameData?.players || []}
					keyExtractor={(item) => item?.uid}
					renderItem={renderPlayerItem}
					style={styles.playersList}
				/>
			)}
			{startGameButton()}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
		backgroundColor: Theme.color.secondary[150],
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
		fontFamily: "Nunito_500Medium",
		color: Theme.color.primary.DEFAULT,
	},
	uuidContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	uuid: {
		fontSize: 14,
		flex: 1,
		fontFamily: "Nunito_400Regular",
	},
	button: {
		backgroundColor: Theme.color.primary.DEFAULT,
		padding: 15,
		borderRadius: 4,
		marginTop: 16,
		alignItems: "center",
		width: "100%",
	},
	buttonText: {
		color: "white",
		fontSize: 20,
		fontFamily: "Nunito_500Medium",
	},
	playersList: {
		width: "100%",
		marginBottom: 16,
		marginTop: 16,
	},
	playerItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
		padding: 12,
		backgroundColor: Theme.color.secondary[250],
		borderRadius: 8,
	},
	playerName: {
		fontSize: 16,
		fontFamily: "Nunito_400Regular",
	},
	hostBadge: {
		color: Theme.color.primary[750],
		marginLeft: 8,
		fontFamily: "Nunito_700Bold",
	},
	waitingText: {
		fontSize: 16,
		marginTop: 16,
		fontFamily: "Nunito_400Regular",
		color: Theme.color.primary[500],
	},
});

export default SequenceWaitingArea;
