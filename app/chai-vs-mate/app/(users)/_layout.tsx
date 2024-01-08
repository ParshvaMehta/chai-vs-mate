import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";

export default function TabLayout() {
	const { user } = useContext(AuthContext);
	if (user) {
		return <Redirect href="/(app)/dashboard" />;
	}

	return (
		<Stack initialRouteName="login">
			<Stack.Screen name="login" options={{ headerShown: false }} />
			<Stack.Screen name="signup" options={{ headerShown: false }} />
		</Stack>
	);
}

export const unstable_settings = {
	initialRouteName: "login",
};
