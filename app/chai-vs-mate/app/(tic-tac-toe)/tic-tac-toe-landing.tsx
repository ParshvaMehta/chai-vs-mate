import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Theme } from "../../constants/Colors";
import { useNavigation } from "expo-router";
import { GAME_TYPE } from "./helper/tic-tac-toe-helper";

interface ButtonProps {
	iconName: string;
	text: string;
	onPress: () => void;
	disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
	iconName,
	text,
	onPress,
	disabled,
}) => {
	let btnStyle = styles.button;
	let textStyle = styles.buttonText;
	let iconStyle = styles.icon;
	if (disabled) {
		btnStyle = {
			...btnStyle,
			backgroundColor: Theme.color.secondary[200],
		};
		textStyle = {
			...textStyle,
			color: Theme.color.secondary[350],
		};
		iconStyle = {
			...iconStyle,
			color: Theme.color.secondary[350],
		};
	}
	return (
		<TouchableOpacity style={btnStyle} onPress={onPress}>
			<Icon
				name={iconName}
				size={iconSize}
				color={iconStyle.color}
				style={iconStyle}
			/>
			<Text style={textStyle}>{text}</Text>
		</TouchableOpacity>
	);
};

const TicTacToeLanding: React.FC = () => {
	const navigation = useNavigation();

	const handleSinglePlayerGame = () => {
		navigation.navigate("tic-tac-toe-board", {
			gameType: GAME_TYPE.SINGLE_PLAYER,
		});
	};

	const handleMultiPlayerGame = () => {
		navigation.navigate("tic-tac-toe-board", {
			gameType: GAME_TYPE.MULTI_PLAYER,
		});
	};

	const handleOnlineGame = () => {
		navigation.navigate("tic-tac-toe-board", { gameType: GAME_TYPE.ONLINE });
	};

	return (
		<View style={styles.container}>
			<Button
				iconName="person-outline"
				text="Single Player"
				onPress={handleSinglePlayerGame}
			/>
			<Button
				iconName="people-outline"
				text="Multi Player"
				onPress={handleMultiPlayerGame}
			/>
			<Button
				iconName="globe-outline"
				text="Play online"
				onPress={handleOnlineGame}
				disabled
			/>
		</View>
	);
};

const iconSize = 24;
const iconColor = "white";

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
		color: "white",
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

export default TicTacToeLanding;
