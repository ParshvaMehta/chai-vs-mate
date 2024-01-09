import { Stack, Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";
import { Theme } from "../../constants/Colors";

export default function SequenceGameLayout() {
	const { user } = useContext(AuthContext);
	if (!user) {
		return <Redirect href="/(users)/login" />;
	}

	return (
		<Stack
			initialRouteName="sequence-landing"
			screenOptions={{
				headerShown: true,

				headerTintColor: Theme.color.secondary[100],
				headerStyle: {
					backgroundColor: Theme.color.primary[550],
				},
			}}
		>
			<Stack.Screen
				name="sequence-landing"
				options={{ headerShown: true, title: "Sequence" }}
			/>
			<Stack.Screen
				name="join-sequence"
				options={{ headerShown: true, title: "Join Game" }}
			/>
			<Stack.Screen
				name="sequence-waiting-area"
				options={{ headerShown: true, title: "Waiting zone" }}
			/>
			<Stack.Screen
				name="sequence-board"
				options={{ title: "Sequence", headerShown: true }}
			/>
		</Stack>
	);
}

export const unstable_settings = {
	initialRouteName: "login",
};
