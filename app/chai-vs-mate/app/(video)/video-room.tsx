import React, { useEffect, useState } from "react";
import {
	Text,
	View,
	TextInput,
	TouchableOpacity,
	Alert,
	StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { FIRESTORE } from "../../constants/FireBaseConfig";
import { doc, getDoc } from "firebase/firestore";
import InputWithIcon from "../../components/Input/InputWithIcon";
import { Theme } from "../../constants/Colors";
import { useNavigation } from "expo-router";

const RoomScreen: React.FC = () => {
	const navigation = useNavigation();
	const [roomId, setRoomId] = useState("");
	const [screens, setScreen] = useState("");

	const inputRef = React.createRef<TextInput>();
	const onCallOrJoin = (screen: string) => {
		if (roomId.length > 0) {
			setScreen(screen);
		}
	};

	const handleCallAction = () => {
		navigation.navigate("video-call", {
			roomId: roomId.trim().toString() || "-1",
		});
	};

	const handleJoinCallAction = () => {
		navigation.navigate("join-call", {
			roomId: roomId.trim().toString() || "-1",
		});
	};

	// generate random room id
	useEffect(() => {
		const generateRandomId = () => {
			const characters = "abcdefghijklmnopqrstuvwxyz";
			let result = "";
			for (let i = 0; i < 7; i++) {
				const randomIndex = Math.floor(Math.random() * characters.length);
				result += characters.charAt(randomIndex);
			}
			return setRoomId("1234");
		};
		generateRandomId();
	}, []);

	// checks if room is existing
	const checkMeeting = async () => {
		if (roomId) {
			const roomRef = doc(FIRESTORE, "room", roomId);
			const roomSnapshot = await getDoc(roomRef);

			if (!roomSnapshot.exists() || roomId === "") {
				Alert.alert("Wait for your instructor to start the meeting.");
				return;
			} else {
				handleJoinCallAction();
			}
		} else {
			Alert.alert("Provide a valid Room ID.");
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Video Call</Text>
			<InputWithIcon
				icon={{
					name: "keypad-outline",
				}}
				ref={inputRef}
				placeholder="Enter GameId"
				value={roomId}
				onChangeText={(text: string) => setRoomId(text)}
			/>
			<View style={{ margin: 5, marginTop: 10 }}>
				<TouchableOpacity
					style={styles.button}
					onPress={() => handleCallAction()}
				>
					<Ionicons
						name="call-outline"
						size={24}
						color="white"
						style={styles.buttonIcon}
					/>
					<Text style={styles.buttonText}>Start meeting</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => checkMeeting()}>
					<Ionicons
						name="arrow-redo-outline"
						size={24}
						color="white"
						style={styles.buttonIcon}
					/>
					<Text style={styles.buttonText}>Join meeting</Text>
				</TouchableOpacity>
			</View>
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
	title: {
		fontSize: 30,
		marginBottom: 5,
		fontFamily: "Nunito_500Medium",
		color: Theme.color.primary.DEFAULT,
	},
});

export default RoomScreen;
