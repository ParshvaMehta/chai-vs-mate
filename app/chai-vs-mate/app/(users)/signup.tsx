import React, { useState, useRef, useContext } from "react";
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
import { validateEmail } from "../../constants/Utils";
import InputWithIcon from "../../components/Input/InputWithIcon";
import { Theme } from "../../constants/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContexts";

const SignupScreen: React.FC = () => {
	const navigation = useNavigation();
	const { createUser, loading, updateUser } = useContext(AuthContext);
	const [displayName, setDisplayName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const passwordInputRef = useRef<TextInput>(null);
	const confirmInputRef = useRef<TextInput>(null);
	const emailInputRef = useRef<TextInput>(null);

	const handleSignup = async () => {
		if (!email || !password || !confirmPassword || !displayName) {
			Alert.alert("Validation Error", "Please enter all required fields.");
			return;
		}

		if (!validateEmail(email)) {
			Alert.alert("Validation Error", "Please enter a valid email address.");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Validation Error", "Passwords do not match.");
			return;
		}
		try {
			const response = await createUser(email, password);
			if (response.user) {
				await updateUser(displayName.trim());
			}
		} catch (error: any) {
			console.log(error);
			const errorMessage =
				error.code === "auth/user-not-found"
					? "User not found. Please check your email."
					: "Sign up failed. Please check your credentials.";
			Alert.alert("Sign Up Failed", errorMessage);
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
					<Text style={styles.title}>Start Journey!</Text>
					<Text style={styles.subTitle}>Ready to join?</Text>
					<InputWithIcon
						icon={{
							name: "ios-person",
						}}
						placeholder="Full Name*"
						value={displayName}
						onChangeText={(text: string) => setDisplayName(text)}
						returnKeyType="next"
						onSubmitEditing={() => emailInputRef.current?.focus()}
					/>
					<InputWithIcon
						icon={{
							name: "mail",
						}}
						ref={emailInputRef}
						placeholder="Email*"
						keyboardType="email-address"
						autoCapitalize="none"
						value={email}
						onChangeText={(text: string) => setEmail(text)}
						returnKeyType="next"
						onSubmitEditing={() => passwordInputRef.current?.focus()}
					/>
					<InputWithIcon
						icon={{
							name: "eye",
						}}
						ref={passwordInputRef}
						placeholder="Password*"
						secureTextEntry
						value={password}
						onChangeText={(text: string) => setPassword(text)}
						returnKeyType="next"
						onSubmitEditing={() => confirmInputRef.current?.focus()}
						autoCapitalize="none"
					/>
					<InputWithIcon
						icon={{
							name: "eye",
						}}
						ref={confirmInputRef}
						placeholder="Confirm Password*"
						secureTextEntry
						value={confirmPassword}
						onChangeText={(text: string) => setConfirmPassword(text)}
						returnKeyType="done"
						onSubmitEditing={handleSignup}
						autoCapitalize="none"
					/>
					<TouchableOpacity
						style={styles.button}
						onPress={handleSignup}
						disabled={loading}
					>
						<Text style={styles.buttonText}>
							{loading ? "Signing Up..." : "Sign Up"}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigation.navigate("login")}>
						<Text style={styles.link}>Let’s play! Log in.</Text>
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

export default SignupScreen;
