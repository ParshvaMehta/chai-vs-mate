import React, { useState, useEffect, useContext } from "react";
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
import InputWithIcon from "../../components/Input/InputWithIcon";
import { Theme } from "../../constants/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../../contexts/AuthContexts";
import { useNavigation } from "expo-router";

const ProfileScreen: React.FC = () => {
	const [displayName, setDisplayName] = useState<string>("");
	const { user, updateUser, logOut, loading } = useContext(AuthContext);
	const navigation = useNavigation();

	useEffect(() => {
		if (user) {
			setDisplayName(user.displayName || "");
		}
	}, [user]);

	const handleUpdateProfile = async () => {
		try {
			await updateUser(displayName);
		} catch (error) {
			console.error("Error updating profile:", error?.message);
		}
	};

	const handleLogout = async () => {
		await logOut();
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
						<Text style={styles.text}>{user?.email}</Text>
						{user?.emailVerified && (
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
						onChangeText={(text: string) => setDisplayName(text)}
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
