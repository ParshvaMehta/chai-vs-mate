import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Theme } from "../../constants/Colors";
import { useNavigation } from "expo-router";

export default function TicTacToeLanding() {
	const [loading, setLoading] = React.useState(false);
	const navigation = useNavigation();
	const handleSinglePlayerGame = () => {
		navigation.navigate("tic-tac-toe-board");
	};
	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.button}
				onPress={() => handleSinglePlayerGame()}
				disabled={true}
			>
				<Icon
					name="person-outline"
					size={24}
					color="white"
					style={styles.icon}
				/>
				<Text style={styles.buttonText}>Single Player</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.button}
				onPress={() => handleSinglePlayerGame()}
				disabled={loading}
			>
				<Icon
					name="people-outline"
					size={24}
					color="white"
					style={styles.icon}
				/>
				<Text style={styles.buttonText}>Multi Player</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.button}
				onPress={() => handleSinglePlayerGame()}
				disabled={loading}
			>
				<Icon
					name="globe-outline"
					size={24}
					color="white"
					style={styles.icon}
				/>
				<Text style={styles.buttonText}>Play online</Text>
			</TouchableOpacity>
		</View>
	);
}

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
