import { Stack, Redirect, useNavigation } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";
import { Theme } from "../../constants/Colors";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function SequenceGameLayout() {
	const { user } = useContext(AuthContext);
	const navigation = useNavigation();
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
				options={{
					headerShown: true,
					title: "Sequence",
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
				name="join-sequence"
				options={{ headerShown: true, title: "Join Game" }}
			/>
			<Stack.Screen
				name="sequence-waiting-area"
				options={{ headerShown: true, title: "Waiting zone" }}
			/>
			<Stack.Screen
				name="sequence-board"
				options={{
					title: "Sequence",
					headerShown: true,
					headerLeft: () => (
						<TouchableOpacity
							onPress={() => navigation.navigate("sequence-landing")}
						>
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
		</Stack>
	);
}

export const unstable_settings = {
	initialRouteName: "login",
};
