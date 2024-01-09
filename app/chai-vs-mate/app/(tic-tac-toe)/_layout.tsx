import { Stack, Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";
import { Theme } from "../../constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";

export default function TicTacToeGameLayout() {
	const { user } = useContext(AuthContext);
	const navigation = useNavigation();
	if (!user) {
		return <Redirect href="/(users)/login" />;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerTintColor: Theme.color.secondary[100],
				headerStyle: {
					backgroundColor: Theme.color.primary[550],
				},
			}}
		>
			<Stack.Screen
				name="tic-tac-toe-landing"
				options={{
					headerShown: true,
					title: "Select Game",
					headerLeft: () => (
						<TouchableOpacity onPress={() => navigation.navigate("dashboard")}>
							<Icon
								name="arrow-back-outline"
								size={24}
								color={"white"}
								style={{ marginRight: 8 }}
							/>
						</TouchableOpacity>
					),
				}}
			/>
			<Stack.Screen
				name="tic-tac-toe-board"
				options={{ headerShown: true, title: "Tic Tac Toe" }}
			/>
		</Stack>
	);
}
