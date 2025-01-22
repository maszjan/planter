import React, { useState, useRef } from "react";
import {
	SafeAreaView,
	Text,
	TouchableOpacity,
	StyleSheet,
	View,
	Image,
	Button,
	ScrollView,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#334155",
	},
	headerText: {
		color: "#7BC9FF",
		fontSize: 24,
		fontWeight: "bold",
		marginLeft: 10,
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		bottom: 20,
		width: "100%",
	},
	button: {
		padding: 15,
		borderRadius: 5,
		marginHorizontal: 10,
		backgroundColor: "#334155",
		flexDirection: "row",
		alignItems: "center",
	},
	buttonText: {
		color: "#7BC9FF",
		fontSize: 12,
		marginLeft: 5,
	},
	previewContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#334155",
	},
	preview: {
		width: "100%",
		height: "60%",
	},
	responseText: {
		color: "#7BC9FF",
		fontSize: 18,
		margin: 10,
		textAlign: "center",
	},
	plantname: {
		color: "#7BC9FF",
		fontSize: 30,
		textAlign: "center",
		fontWeight: "bold",
		margin: 10,
	},
	plantnamebg: {
		justifyContent: "center",
		backgroundColor: "#334155",
	},
	descriptionContainer: {
		marginHorizontal: 20,
		marginVertical: 10,
	},
	descriptionText: {
		color: "white",
		fontSize: 18,
		textAlign: "center",
	},
});

const HomeScreen: React.FC = () => {
	const [photo, setPhoto] = useState<string | null>(null);
	const [plantInfo, setPlantInfo] = useState<{
		name: string;
		description: string;
	} | null>(null);
	const [cameraType, setCameraType] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView | null>(null);

	const takePicture = async () => {
		if (cameraRef.current) {
			const options = { quality: 0.5, base64: true };
			const data = await cameraRef.current.takePictureAsync(options);
			const sourceUri = data.uri;

			// Save the photo permanently
			const destinationUri = `${
				FileSystem.documentDirectory
			}photos/${Date.now()}.jpg`;
			await FileSystem.makeDirectoryAsync(
				`${FileSystem.documentDirectory}photos`,
				{ intermediates: true },
			);
			await FileSystem.copyAsync({
				from: sourceUri,
				to: destinationUri,
			});

			setPhoto(destinationUri);

			// Send the photo to the backend for recognition
			const formData = new FormData();
			formData.append("file", {
				uri: destinationUri,
				type: "image/jpeg",
				name: "photo.jpg",
			});

			try {
				const response = await axios.post(
					"http://192.168.1.138:8000/api/v1/recognize-plant/",
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					},
				);

				const { name, description } = await response.data;
				setPlantInfo({ name, description });
			} catch (error) {
				console.error("Error recognizing plant:", error);
			}
		}
	};

	if (!permission) {
		// Camera permissions are still loading.
		return <View />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<View style={styles.container}>
				<Text style={styles.message}>
					We need your permission to show the camera
				</Text>
				<Button onPress={requestPermission} title='grant permission' />
			</View>
		);
	}

	const toggleCameraType = () => {
		setCameraType((current) => (current === "back" ? "front" : "back"));
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Icon name='leaf' size={30} color='#7BC9FF' />
				<Text style={styles.headerText}>Planter</Text>
			</View>
			{!photo ? (
				<CameraView
					style={styles.camera}
					type={cameraType}
					ref={cameraRef}
					onCameraReady={() => console.log("Camera is ready")}>
					<View style={styles.buttonContainer}>
						<TouchableOpacity onPress={takePicture} style={styles.button}>
							<Icon name='camera' size={30} color='#7BC9FF' />
						</TouchableOpacity>
					
					</View>
				</CameraView>
			) : (
				<View style={styles.previewContainer}>
					<View style={styles.plantnamebg}>
						{plantInfo && (
							<Text style={styles.plantname}>{plantInfo.name}</Text>
						)}
					</View>
					<Image source={{ uri: photo }} style={styles.preview} />
					{plantInfo && (
						<ScrollView style={styles.descriptionContainer}>
							<Text style={styles.descriptionText}>
								{plantInfo.description}
							</Text>
						</ScrollView>
					)}
					<TouchableOpacity
						onPress={() => setPhoto(null)}
						style={styles.button}>
						<Icon name='refresh' size={20} color='#7BC9FF' />
						<Text style={styles.buttonText}>Zacznij od nowa</Text>
					</TouchableOpacity>
				</View>
			)}
		</SafeAreaView>
	);
};

export default HomeScreen;
