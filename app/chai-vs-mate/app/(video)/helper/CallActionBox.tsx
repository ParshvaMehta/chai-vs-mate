import { View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../../constants/Colors";

interface CallActionBoxProps {
	switchCamera: () => void;
	toggleMute: () => void;
	toggleCamera: () => void;
	endCall: () => void;
}
const ICON_SIZE = 28;
const CallActionBox: React.FC<CallActionBoxProps> = ({
	switchCamera,
	toggleMute,
	toggleCamera,
	endCall,
}) => {
	const [isCameraOn, setIsCameraOn] = useState(true);
	const [isMicOn, setIsMicOn] = useState(true);

	const onToggleCamera = () => {
		try {
			toggleCamera();
			setIsCameraOn(!isCameraOn);
		} catch (error) {
			console.error("Error toggling camera:", error);
		}
	};

	const onToggleMicrophone = () => {
		try {
			toggleMute();
			setIsMicOn(!isMicOn);
		} catch (error) {
			console.error("Error toggling microphone:", error);
		}
	};

	const onEndCall = () => {
		try {
			endCall();
		} catch (error) {
			console.error("Error ending call:", error);
		}
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.button} onPress={switchCamera}>
				<Ionicons
					name="camera-reverse-outline"
					size={ICON_SIZE}
					color="white"
				/>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={onToggleCamera}>
				<Ionicons
					name={isCameraOn ? "videocam-outline" : "md-eye-off-outline"}
					size={ICON_SIZE}
					color="white"
				/>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={onToggleMicrophone}>
				<Ionicons
					name={isMicOn ? "mic-outline" : "mic-off-outline"}
					size={ICON_SIZE}
					color="white"
				/>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={onEndCall}>
				<Ionicons name={"call"} size={ICON_SIZE} color="white" />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: ICON_SIZE * 2,
		padding: 5,
		borderColor: Theme.color.primary[100],
		backgroundColor: Theme.color.primary[100],
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	button: {
		backgroundColor: Theme.color.primary[500],
		alignContent: "center",
		justifyContent: "center",
		width: ICON_SIZE + 15,
		padding: 7.5,
		borderRadius: 20,
	},
});

export default CallActionBox;
