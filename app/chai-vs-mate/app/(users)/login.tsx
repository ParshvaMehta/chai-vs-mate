import { signInWithEmailAndPassword, Auth } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Keyboard,
	Platform,
} from "react-native";
import { FIREBASE_AUTH } from "../../constants/FireBaseConfig";
import { validateEmail } from "../../constants/Utils";
import Ionicons from "react-native-vector-icons/Ionicons";
import InputWithIcon from "../../components/Input/InputWithIcon";
import { Theme } from "../../constants/Colors";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
	const navigation = useNavigation();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const passwordInputRef = useRef<TextInput>(null);
	const auth: Auth = FIREBASE_AUTH;
	const handleLoginWithEmail = async () => {
		if (!email || !password) {
			Alert.alert("Validation Error", "Please enter both email and password.");
			return;
		}
		// Email format validation
		if (!validateEmail(email)) {
			Alert.alert("Validation Error", "Please enter a valid email address.");
			return;
		}
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error: any) {
			console.log(error);
			const errorMessage =
				error.code === "auth/user-not-found"
					? "User not found. Please check your email."
					: "Sign in failed. Please check your credentials.";
			Alert.alert("Sign In Failed", errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View style={styles.container}>
					<Ionicons {...styles.icon} name="game-controller-outline" />
					<Text style={styles.title}>Hello Again!</Text>
					<Text style={styles.subTitle}>Ready to play?</Text>
					<InputWithIcon
						icon={{
							name: "ios-person",
						}}
						placeholder="Email*"
						keyboardType="email-address"
						autoCapitalize="none"
						value={email}
						returnKeyType="next"
						onSubmitEditing={() => passwordInputRef.current?.focus()}
						onChangeText={(text: string) => setEmail(text)}
					/>
					<InputWithIcon
						icon={{
							name: "eye",
						}}
						ref={passwordInputRef}
						placeholder="Password*"
						autoCapitalize="none"
						secureTextEntry
						value={password}
						onChangeText={(text: string) => setPassword(text)}
						returnKeyType="done" // Set returnKeyType to "done"
						onSubmitEditing={handleLoginWithEmail} // Trigger login action
					/>
					<TouchableOpacity
						style={styles.button}
						onPress={handleLoginWithEmail}
						disabled={loading}
					>
						<Text style={styles.buttonText}>
							{loading ? "Logging in..." : "Login"}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigation.navigate("signup")}>
						<Text style={styles.link}>New here? Just touch here!</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	icon: {
		size: 100,
		color: Theme.color.primary.DEFAULT,
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
		width: "100%",
		backgroundColor: "white",
	},
	title: {
		fontSize: 36,
		marginBottom: 5,
		fontFamily: "Nunito_500Medium",
	},
	subTitle: {
		fontSize: 20,
		marginBottom: 36,
		fontFamily: "Nunito_500Medium",
		color: "#9095A1",
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
	link: {
		marginTop: 24,
		color: Theme.color.primary.DEFAULT,
		fontSize: 20,
		fontFamily: "Nunito_500Medium",
		textDecorationStyle: "solid",
		textDecorationLine: "underline",
	},
});

export default LoginScreen;
