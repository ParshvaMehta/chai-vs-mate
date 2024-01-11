import React, { useState, useEffect } from "react";
import { View } from "react-native";
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
	doc,
	setDoc,
	getDoc,
	updateDoc,
	onSnapshot,
	deleteField,
} from "firebase/firestore";
import CallActionBox from "./helper/CallActionBox";
import { useLocalSearchParams, useNavigation } from "expo-router";

const configuration = {
	iceServers: [
		{
			urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
		},
	],
	iceCandidatePoolSize: 10,
};

const JoinScreen: React.FC = () => {
	const navigation = useNavigation();
	const [localStream, setLocalStream] = useState<MediaStream>();
	const [remoteStream, setRemoteStream] = useState<MediaStream>();
	const [cachedLocalPC, setCachedLocalPC] = useState<RTCPeerConnection>();
	const local = useLocalSearchParams();
	const { roomId } = local;

	const [isMuted, setIsMuted] = useState(false);
	const [isOffCam, setIsOffCam] = useState(false);

	useEffect(() => {
		startLocalStream();
	}, []);

	useEffect(() => {
		if (localStream) {
			joinCall(roomId.toString());
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

			const roomRef = doc(FIRESTORE, "room", roomId);
			await updateDoc(roomRef, { answer: deleteField(), connected: false });

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

	const joinCall = async (id: string) => {
		try {
			const roomRef = doc(FIRESTORE, "room", id);
			const roomSnapshot = await getDoc(roomRef);

			if (!roomSnapshot.exists) return;
			const localPC = new RTCPeerConnection(configuration);
			localStream?.getTracks().forEach((track) => {
				localPC.addTrack(track, localStream!);
			});

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
				addDoc(calleeCandidatesCollection, e.candidate.toJSON());
			});

			localPC.ontrack = (e) => {
				const newStream = new MediaStream();
				e.streams[0].getTracks().forEach((track) => {
					newStream.addTrack(track);
				});
				setRemoteStream(newStream);
			};

			const offer = roomSnapshot.data().offer;
			await localPC.setRemoteDescription(new RTCSessionDescription(offer));

			const answer = await localPC.createAnswer();
			await localPC.setLocalDescription(answer);

			await updateDoc(roomRef, { answer, connected: true }, { merge: true });

			onSnapshot(callerCandidatesCollection, (snapshot) => {
				snapshot.docChanges().forEach((change) => {
					if (change.type === "added") {
						let data = change.doc.data();
						localPC.addIceCandidate(new RTCIceCandidate(data));
					}
				});
			});

			onSnapshot(roomRef, (doc) => {
				const data = doc.data();
				if (!data?.answer) {
					navigation.navigate("video-room");
				}
			});

			setCachedLocalPC(localPC);
		} catch (error) {
			console.error("Error joining call:", error);
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
		<View style={{ flex: 1 }}>
			<RTCView
				style={{ flex: 1 }}
				streamURL={remoteStream && remoteStream.toURL()}
				objectFit={"cover"}
			/>

			{remoteStream && !isOffCam && (
				<RTCView
					style={{
						width: 32,
						height: 48,
						position: "absolute",
						right: 6,
						top: 8,
					}}
					streamURL={localStream && localStream.toURL()}
				/>
			)}
			<View style={{ position: "absolute", bottom: 0, width: "100%" }}>
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

export default JoinScreen;
