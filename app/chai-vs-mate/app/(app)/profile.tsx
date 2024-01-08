// ProfileScreen.tsx

import React, { useState, useEffect } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Text,
	TouchableWithoutFeedback,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { updateProfile } from "firebase/auth";
import { FIREBASE_AUTH } from "../../constants/FireBaseConfig";
import InputWithIcon from "../../components/Input/InputWithIcon";
import { Theme } from "../../constants/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";

const ProfileScreen: React.FC = () => {
	const auth = FIREBASE_AUTH;
	const [displayName, setDisplayName] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const currentUser = auth.currentUser;

		if (currentUser) {
			setDisplayName(currentUser.displayName || "");
		}
	}, [auth.currentUser]);

	const handleUpdateProfile = async () => {
		try {
			setLoading(true);
			await updateProfile(auth?.currentUser, {
				displayName,
			});
		} catch (error) {
			console.error("Error updating profile:", error?.message);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		await auth.signOut();
	};
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View style={styles.container}>
					<Ionicons name="person-circle-outline" {...styles.icon} size={100} />
					<View style={styles.infoContainer}>
						<Text style={styles.text}>{auth?.currentUser?.email}</Text>
						{auth?.currentUser?.emailVerified && (
							<Ionicons
								name="checkmark-circle"
								size={20}
								style={{
									...styles.icon,
									color: Theme.color.primary.DEFAULT,
								}}
							/>
						)}
					</View>
					<InputWithIcon
						icon={{
							name: "ios-person",
						}}
						placeholder="Display Name"
						value={displayName}
						onChangeText={(text) => setDisplayName(text)}
					/>
					<TouchableOpacity
						style={styles.button}
						onPress={handleUpdateProfile}
						disabled={loading}
					>
						<Text style={styles.buttonText}>
							{loading ? "Hold on..." : "Save"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => handleLogout()}>
						<Text style={styles.link}>Take a break!</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 10,
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
		width: "100%",
		backgroundColor: Theme.color.secondary[150],
		fontFamily: "Nunito_500Medium",
	},
	infoContainer: {
		flexDirection: "row",
		gap: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	icon: {
		size: 20,
		color: Theme.color.primary.DEFAULT,
	},
	text: {
		fontSize: 20,
		fontFamily: "Nunito_500Medium",
	},
	button: {
		backgroundColor: Theme.color.primary.DEFAULT,
		padding: 12,
		borderRadius: 4,
		marginTop: 20,
		alignItems: "center",
		width: "100%",
	},
	buttonText: {
		color: "white",
		fontSize: 20,
		fontFamily: "Nunito_500Medium",
	},
	link: {
		marginTop: 36,
		color: Theme.color.primary.DEFAULT,
		fontSize: 20,
		fontFamily: "Nunito_500Medium",
		textDecorationStyle: "solid",
		textDecorationLine: "underline",
	},
});

export default ProfileScreen;
