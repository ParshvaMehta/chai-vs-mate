import { Stack, Redirect, useNavigation } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";
import { Theme } from "../../constants/Colors";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function VideoCallLayout() {
	const { user } = useContext(AuthContext);
	const navigation = useNavigation();
	if (!user) {
		return <Redirect href="/(users)/login" />;
	}

	return (
		<Stack
			initialRouteName="video-room"
			screenOptions={{
				headerShown: true,
				headerTintColor: Theme.color.secondary[100],
				headerStyle: {
					backgroundColor: Theme.color.primary[550],
				},
			}}
		>
			<Stack.Screen
				name="video-room"
				options={{
					headerShown: true,
					title: "Room",
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
				name="video-call"
				options={{ headerShown: true, title: "Video Call" }}
			/>
			<Stack.Screen
				name="join-call"
				options={{ headerShown: true, title: "Video Call" }}
			/>
		</Stack>
	);
}
