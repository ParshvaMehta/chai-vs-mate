import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs, Stack, Redirect } from "expo-router";
import { Pressable, useColorScheme } from "react-native";

import Colors from "../../constants/Colors";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
	name: React.ComponentProps<typeof FontAwesome>["name"];
	color: string;
}) {
	return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
	const colorScheme = useColorScheme();
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
