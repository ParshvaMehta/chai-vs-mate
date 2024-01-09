import React from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { Theme } from "../../constants/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "expo-router";

const gamesData = [
	{
		id: "1",
		title: "Game of Jack",
		description: "A challenging board game for 7+ ages.",
		screen: "(sequence)",
		icon: "color-wand",
		isActive: true,
	},
	{
		id: "2",
		title: "Tic Tac Toe",
		description: "Where Every Move Counts!",
		screen: "(tic-tac-toe)",
		icon: "apps-outline",
		isActive: true,
	},
	{
		id: "3",
		title: "Ludo",
		description: "Coming Soon!",
		screen: "404",
		icon: "alarm",
	},
	{
		id: "4",
		title: "Chess",
		description: "Coming Soon!",
		screen: "404",
		icon: "alarm",
	},
];

const Dashboard: React.FC = () => {
	const navigation = useNavigation();
	const renderGameItem = ({ item }) => {
		let style = {
			gameItem: styles.gameItem,
			gameDetails: styles.gameDetails,
			gameTitle: styles.gameTitle,
			gameDescription: styles.gameDescription,
			gameIcon: styles.gameIcon,
		};
		if (!item.isActive) {
			style.gameItem = {
				...styles.gameItem,
				backgroundColor: Theme.color.secondary[200],
			};
			style.gameTitle = {
				...style.gameTitle,
				color: Theme.color.secondary[350],
			};
			style.gameDescription = {
				...style.gameDescription,
				color: Theme.color.secondary[350],
			};
			style.gameIcon = {
				...style.gameIcon,
				color: Theme.color.secondary[350],
			};
		}
		return (
			<TouchableOpacity
				style={style.gameItem}
				onPress={() => navigation.navigate(item.screen)}
				disabled={!item.isActive}
			>
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						gap: 20,
						alignItems: "center",
						alignContent: "center",
					}}
				>
					<View>
						<Ionicons name={item.icon} {...style.gameIcon} />
					</View>
					<View style={style.gameDetails}>
						<Text style={style.gameTitle}>{item.title}</Text>
						<Text style={style.gameDescription}>{item.description}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={gamesData}
				keyExtractor={(item) => item.id}
				renderItem={renderGameItem}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: Theme.color.secondary[150],
	},
	gameIcon: {
		color: Theme.color.primary[200],
		size: 36,
	},
	gameItem: {
		backgroundColor: Theme.color.secondary[800],
		borderRadius: 8,
		elevation: 2,
		marginVertical: 8,
		paddingHorizontal: 16,
		paddingVertical: 20,
	},
	gameDetails: {
		flex: 1,
	},
	gameTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
		fontFamily: "Nunito_500Medium",
		color: Theme.color.primary[200],
	},
	gameDescription: {
		fontSize: 14,
		color: Theme.color.primary[200],
		fontFamily: "Nunito_300Light",
	},
});

export default Dashboard;
