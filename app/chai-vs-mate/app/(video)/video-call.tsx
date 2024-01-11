import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import {
	RTCPeerConnection,
	RTCView,
	mediaDevices,
	RTCIceCandidate,
	RTCSessionDescription,
	MediaStream,
} from "react-native-webrtc";
import { FIRESTORE } from "../../constants/FireBaseConfig";
import {
	addDoc,
	collection,
	setDoc,
	updateDoc,
	onSnapshot,
	deleteField,
} from "firebase/firestore";

import { doc } from "firebase/firestore";

import CallActionBox from "./helper/CallActionBox";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Theme } from "../../constants/Colors";

const configuration = {
	iceServers: [
		{
			urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
		},
	],
	iceCandidatePoolSize: 10,
};

const CallScreen: React.FC = () => {
	const navigation = useNavigation();
	const local = useLocalSearchParams();
	const { roomId } = local;
	const [localStream, setLocalStream] = useState<MediaStream>();
	const [remoteStream, setRemoteStream] = useState<MediaStream>();
	const [cachedLocalPC, setCachedLocalPC] = useState<RTCPeerConnection>();

	const [isMuted, setIsMuted] = useState(false);
	const [isOffCam, setIsOffCam] = useState(false);

	useEffect(() => {
		startLocalStream();
	}, []);

	useEffect(() => {
		if (localStream && roomId) {
			startCall(roomId.toString());
		}
	}, [localStream, roomId]);

	async function endCall() {
		try {
			if (cachedLocalPC) {
				const senders = cachedLocalPC.getSenders();
				senders.forEach((sender) => {
					cachedLocalPC.removeTrack(sender);
				});
				cachedLocalPC.close();
			}
			if (roomId) {
				const roomRef = doc(FIRESTORE, "room", roomId);
				doc(FIRESTORE, "room", roomId);
				await updateDoc(roomRef, { answer: deleteField() });
			}

			setLocalStream(undefined);
			setRemoteStream(undefined);
			setCachedLocalPC(undefined);
			navigation.navigate("video-room");
		} catch (error) {
			console.error("Error ending call:", error);
		}
	}

	const startLocalStream = async () => {
		try {
			const isFront = true;
			const devices = await mediaDevices.enumerateDevices();
			const facing = isFront ? "front" : "environment";
			const videoSourceId = devices.find(
				(device) => device.kind === "videoinput" && device.facing === facing
			);
			const facingMode = isFront ? "user" : "environment";
			const constraints = {
				audio: true,
				video: {
					mandatory: {
						minWidth: 500,
						minHeight: 300,
						minFrameRate: 30,
					},
					facingMode,
					optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
				},
			};
			const newStream = await mediaDevices.getUserMedia(constraints);
			setLocalStream(newStream);
		} catch (error) {
			console.error("Error starting local stream:", error);
		}
	};

	const startCall = async (id: string) => {
		try {
			const localPC = new RTCPeerConnection(configuration);
			localStream?.getTracks().forEach((track) => {
				localPC.addTrack(track, localStream!);
			});

			const roomRef = doc(FIRESTORE, "room", id);
			const callerCandidatesCollection = collection(
				roomRef,
				"callerCandidates"
			);
			const calleeCandidatesCollection = collection(
				roomRef,
				"calleeCandidates"
			);

			localPC.addEventListener("icecandidate", (e) => {
				if (!e.candidate) {
					console.log("Got final candidate!");
					return;
				}
				addDoc(callerCandidatesCollection, e.candidate.toJSON());
			});

			localPC.ontrack = (e) => {
				const newStream = new MediaStream();
				e.streams[0].getTracks().forEach((track) => {
					newStream.addTrack(track);
				});
				setRemoteStream(newStream);
			};

			const offer = await localPC.createOffer();
			await localPC.setLocalDescription(offer);

			await setDoc(roomRef, { offer, connected: false }, { merge: true });

			onSnapshot(roomRef, (doc) => {
				const data = doc.data();
				if (!localPC.currentRemoteDescription && data.answer) {
					const rtcSessionDescription = new RTCSessionDescription(data.answer);
					localPC.setRemoteDescription(rtcSessionDescription);
				} else {
					setRemoteStream(undefined);
				}
			});

			onSnapshot(calleeCandidatesCollection, (snapshot) => {
				snapshot.docChanges().forEach((change) => {
					if (change.type === "added") {
						let data = change.doc.data();
						localPC.addIceCandidate(new RTCIceCandidate(data));
					}
				});
			});

			setCachedLocalPC(localPC);
		} catch (error) {
			console.error("Error starting call:", error);
		}
	};

	const switchCamera = () => {
		localStream?.getVideoTracks().forEach((track) => track._switchCamera());
	};

	const toggleMute = () => {
		try {
			if (!remoteStream) {
				return;
			}
			localStream?.getAudioTracks().forEach((track) => {
				track.enabled = !track.enabled;
				setIsMuted(!track.enabled);
			});
		} catch (error) {
			console.error("Error toggling mute:", error);
		}
	};

	const toggleCamera = () => {
		try {
			localStream?.getVideoTracks().forEach((track) => {
				track.enabled = !track.enabled;
				setIsOffCam(!isOffCam);
			});
		} catch (error) {
			console.error("Error toggling camera:", error);
		}
	};

	return (
		<View style={styles.container}>
			<Text>{roomId}</Text>
			{!remoteStream && (
				<RTCView
					style={styles.localStreamFullScreen}
					streamURL={localStream && localStream.toURL()}
					objectFit={"cover"}
				/>
			)}

			{remoteStream && (
				<>
					<RTCView
						style={styles.flex1}
						streamURL={remoteStream && remoteStream.toURL()}
						objectFit={"cover"}
					/>
					{!isOffCam && (
						<RTCView
							style={styles.localStreamView}
							streamURL={localStream && localStream.toURL()}
						/>
					)}
				</>
			)}
			<View style={styles.actionBox}>
				<CallActionBox
					switchCamera={switchCamera}
					toggleMute={toggleMute}
					toggleCamera={toggleCamera}
					endCall={endCall}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: Theme.color.primary[200],
		height: "100%",
	},
	flex1: { flex: 1 },
	localStreamFullScreen: {
		flex: 1,
		width: "100%",
		height: "100%",
		position: "absolute",
	},
	localStreamView: {
		width: 32,
		height: 48,
		position: "absolute",
		right: 6,
		top: 8,
	},
	actionBox: { position: "absolute", bottom: 0, width: "100%" },
});

export default CallScreen;
