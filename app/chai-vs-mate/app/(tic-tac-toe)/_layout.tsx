import { Stack, Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";
import { Theme } from "../../constants/Colors";

export default function TicTacToeGameLayout() {
	const { user } = useContext(AuthContext);
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
				options={{ headerShown: true, title: "Select Game" }}
			/>
			<Stack.Screen
				name="tic-tac-toe-board"
				options={{ headerShown: true, title: "Tic Tac Toe" }}
			/>
		</Stack>
	);
}
