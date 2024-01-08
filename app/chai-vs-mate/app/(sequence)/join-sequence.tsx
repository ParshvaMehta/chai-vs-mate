import { ref, get } from "firebase/database";
import React, { useState, useEffect } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	Text,
	StyleSheet,
	Alert,
	Clipboard,
} from "react-native";
import { FIREBASE_DB } from "../../constants/FireBaseConfig";
import InputWithIcon from "../../components/Input/InputWithIcon";
import { Theme } from "../../constants/Colors";
import { isValidUUID } from "../../constants/Utils";
import { Ionicons } from "@expo/vector-icons";
import { GameStatus, SequenceGame } from "./helpers/types";
import { useNavigation } from "expo-router";

const JoinSequenceGame: React.FC = () => {
	const [gameUUID, setGameUUID] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const inputRef = React.createRef<TextInput>();
	const navigation = useNavigation();

	useEffect(() => {
		if (!inputRef || !inputRef.current) {
			return;
		}
		// Automatically focus on the UUID input when the screen loads
		inputRef?.current?.focus();
		// Check if there's anything in the clipboard and set it as the initial value
		Clipboard.getString()
			.then((clipboardContent) => {
				if (clipboardContent && isValidUUID(clipboardContent)) {
					setGameUUID(clipboardContent.trim());
				}
			})
			.catch((error) => console.error("Error reading clipboard:", error));
	}, []);

	const handleJoinGame = async () => {
		try {
			setLoading(true);
			if (!isValidUUID(gameUUID.trim())) {
				Alert.alert("Invalid Game", "Please Check the game id!!");
				setLoading(false);
				return;
			}
			const dbId = `games/sequence/${gameUUID.trim()}`;
			const gameRef = ref(FIREBASE_DB, dbId);
			const snapshot = await get(gameRef);
			if (!snapshot.exists()) {
				Alert.alert("Invalid Game", "Please Check the game id!!");
				return;
			}
			const data = snapshot.val() as SequenceGame;
			if (data?.game_status === GameStatus.INPROGRESS) {
				navigation.navigate("SequenceBoard", {
					gameUUID: gameUUID?.trim(),
				});
				return;
			}
			navigation.navigate("sequence-waiting-area", {
				gameUUID: gameUUID?.trim(),
			});
		} catch (e) {
			console.error(e);
			Alert.alert("Error", "Server not reachable!!!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Join Game</Text>
			<Text style={styles.subTitle}>
				Enter the GameID, Shared by Host to join the Adventure!!
			</Text>
			<InputWithIcon
				icon={{
					name: "keypad-outline",
				}}
				ref={inputRef}
				placeholder="Enter GameId"
				value={gameUUID}
				onChangeText={(text: string) => setGameUUID(text)}
			/>
			<TouchableOpacity
				style={styles.button}
				disabled={loading}
				onPress={() => handleJoinGame()}
			>
				<Ionicons
					name="arrow-redo-outline"
					size={24}
					color="white"
					style={styles.buttonIcon}
				/>
				<Text style={styles.buttonText}>Join Game</Text>
			</TouchableOpacity>
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
		gap: 30,
	},
	title: {
		fontSize: 30,
		marginBottom: 5,
		fontFamily: "Nunito_500Medium",
		color: Theme.color.primary.DEFAULT,
	},
	subTitle: {
		fontSize: 20,
		marginBottom: 36,
		fontFamily: "Nunito_500Medium",
		color: Theme.color.secondary[600],
	},
	button: {
		backgroundColor: Theme.color.primary[750],
		paddingHorizontal: "15%",
		paddingVertical: 16,
		borderRadius: 8,
		marginBottom: 16,
		width: "80%",
		flexDirection: "row",
		alignItems: "center",
		textAlign: "center",
		gap: 0,
	},
	buttonIcon: {
		color: Theme.color.primary[150],
		paddingRight: 10,
		width: "20%",
	},
	buttonText: {
		color: Theme.color.primary[150],
		fontSize: 20,
		textAlign: "center",
		marginLeft: 10,
		width: "80%",
		fontFamily: "Nunito_500Medium",
	},
});

export default JoinSequenceGame;
