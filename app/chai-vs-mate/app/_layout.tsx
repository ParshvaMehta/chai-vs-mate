import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import {
	ActivityIndicator,
	View,
	useColorScheme,
	StyleSheet,
} from "react-native";
import {
	useFonts,
	Nunito_200ExtraLight,
	Nunito_300Light,
	Nunito_400Regular,
	Nunito_500Medium,
	Nunito_600SemiBold,
	Nunito_700Bold,
	Nunito_800ExtraBold,
	Nunito_900Black,
} from "@expo-google-fonts/nunito";
import { Wellfleet_400Regular } from "@expo-google-fonts/wellfleet";
import { Theme } from "../constants/Colors";
import AuthProvider from "../contexts/AuthContexts";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	const colorScheme = useColorScheme();
	let [fontsLoaded] = useFonts({
		Nunito_200ExtraLight,
		Nunito_300Light,
		Nunito_400Regular,
		Nunito_500Medium,
		Nunito_600SemiBold,
		Nunito_700Bold,
		Nunito_800ExtraBold,
		Nunito_900Black,
		Wellfleet_400Regular,
	});
	if (!fontsLoaded) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator
					size="large" // You can adjust the size here
					color={Theme.color.primary.DEFAULT}
				/>
			</View>
		);
	}
	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<AuthProvider>
				<Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(users)" options={{ headerShown: false }} />
					<Stack.Screen name="(app)" options={{ headerShown: false }} />
					<Stack.Screen name="(sequence)" options={{ headerShown: false }} />
				</Stack>
			</AuthProvider>
		</ThemeProvider>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent white background
		justifyContent: "center",
		alignItems: "center",
	},
});
