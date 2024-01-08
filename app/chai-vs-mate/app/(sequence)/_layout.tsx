import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";

export default function TabLayout() {
	const { user } = useContext(AuthContext);
	if (!user) {
		return <Redirect href="/(users)/login" />;
	}

	return (
		<Stack initialRouteName="sequence-landing">
			<Stack.Screen name="sequence-landing" options={{ headerShown: false }} />
			<Stack.Screen name="join-sequence" options={{ headerShown: false }} />
			<Stack.Screen
				name="sequence-waiting-area"
				options={{ headerShown: true, title: "Waiting zone" }}
			/>
			<Stack.Screen name="sequence-board" options={{ headerShown: false }} />
		</Stack>
	);
}

export const unstable_settings = {
	initialRouteName: "login",
};
