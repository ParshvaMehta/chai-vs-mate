import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, Tabs } from "expo-router";

import { Theme } from "../../constants/Colors";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";
import Ionicons from "react-native-vector-icons/Ionicons";

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
	const { user } = useContext(AuthContext);
	if (!user) {
		return <Redirect href="/(users)/login" />;
	}
	return (
		<Tabs
			screenOptions={{
				headerShown: true,
				tabBarActiveTintColor: Theme.color.primary.DEFAULT,
				tabBarInactiveTintColor: Theme.color.primary[800],
				tabBarStyle: {
					backgroundColor: Theme.color.secondary[250], // Background color of the tab bar
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontFamily: "Nunito_500Medium",
				},
				tabBarShowLabel: true,
				headerTintColor: Theme.color.secondary[100],
				headerStyle: {
					backgroundColor: Theme.color.primary[550],
				},
			}}
		>
			<Tabs.Screen
				name="dashboard"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ focused, color, size }) => {
						const iconName = focused
							? "game-controller"
							: "game-controller-outline";
						return (
							<Ionicons
								name={iconName}
								size={size}
								color={focused ? Theme.color.primary.DEFAULT : color}
							/>
						);
					},
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ focused, color, size }) => {
						const iconName = focused ? "person" : "person-outline";
						return (
							<Ionicons
								name={iconName}
								size={size}
								color={focused ? Theme.color.primary.DEFAULT : color}
							/>
						);
					},
				}}
			/>
		</Tabs>
	);
}
