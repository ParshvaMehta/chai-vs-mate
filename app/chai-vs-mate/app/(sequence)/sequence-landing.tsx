import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ref, set } from "firebase/database"; // Import Realtime Database functions
import { FIREBASE_DB } from "../../constants/FireBaseConfig"; // Import your Firebase database configuration
import { uuid } from "../../constants/Utils";
import { GameStatus, SequenceGame } from "./helpers/types";
import { useNavigation } from "expo-router";
import { Theme } from "../../constants/Colors";
import { AuthContext } from "../../contexts/AuthContexts";

const SequenceLandingScreen: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const { user } = useContext(AuthContext);
	const navigation = useNavigation();
	const handleCreateGame = async () => {
		setLoading(true);
		const gameUUID = await uuid();
		try {
			const { uid, displayName } = await user;
			const game: SequenceGame = {
				created_at: new Date().toISOString(),
				players: [
					{
						uid,
						displayName,
					},
				],
				host: {
					uid,
					displayName,
				},
				game_status: GameStatus.CREATED,
				completed_sequence: {
					R: 0,
					B: 0,
					G: 0,
				},
				winner: "",
			};
			await set(ref(FIREBASE_DB, `games/sequence/${gameUUID}`), game);
			// Navigate to the JoinSequenceGame screen with the gameUUID as a parameter
			await navigation.navigate("sequence-waiting-area", { gameUUID });
		} catch (error) {
			alert("Game not created!");
			console.error("Error creating game:", error.message);
		} finally {
			setLoading(false);
		}
	};
	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.button}
				onPress={() => handleCreateGame()}
				disabled={loading}
			>
				<Icon name="add" size={24} color="white" style={styles.icon} />
				<Text style={styles.buttonText}>Create Game</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.button}
				disabled={loading}
				onPress={() => navigation.navigate("join-sequence")}
			>
				<Icon name="group" size={24} color="white" style={styles.icon} />
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
		gap: 30,
		backgroundColor: Theme.color.secondary[150],
	},
	button: {
		backgroundColor: Theme.color.primary[750],
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
		width: "80%",
		flexDirection: "row",
		alignItems: "center",
	},
	icon: {
		color: Theme.color.primary[150],
		marginRight: 8,
	},
	buttonText: {
		color: Theme.color.primary[150],
		fontSize: 20,
		fontFamily: "Nunito_500Medium",
	},
});

export default SequenceLandingScreen;
