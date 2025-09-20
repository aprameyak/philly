import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

type Prediction = {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
};

export default function SnapShotDetect() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const navigation = useNavigation();

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission]);

  const takeAndDetect = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: false,
        quality: 0.3,
      });

      setCapturedPhoto(photo.uri);
      setMessage("Detecting...");

      const apiKey = "pSXeGpbofKfXU8Rubbi2";
      const project = "graffiti-5sa0t";
      const version = 1;

      const url = `https://detect.roboflow.com/${project}/${version}?api_key=${apiKey}&confidence=0.3&overlap=0.3`;

      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "snap.jpg",
      } as any);

      const rfRes = await fetch(url, { method: "POST", body: formData });
      const data = await rfRes.json();

      if (Array.isArray(data?.predictions) && data.predictions.length > 0) {
        const best = data.predictions.reduce((max: Prediction, p: Prediction) =>
          p.confidence > max.confidence ? p : max
        );

        if (best.confidence >= 0.3) {
          // ✅ redirect if threshold met
          navigation.navigate("Main", {
            screen: "Report",
            params: { autoType: "vandalism" },
          });
        } else {
          setMessage(
            `No anomalies above 30%. Closest: ${best.class} ${(
              best.confidence * 100
            ).toFixed(1)}%`
          );
        }
      } else {
        setMessage("No detections at all. Try again.");
      }
    } catch (err) {
      console.error("Detection error", err);
      setMessage("Error during detection.");
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting permissions…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <>
          <Image source={{ uri: capturedPhoto }} style={styles.preview} />
          <Text style={styles.result}>{message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setCapturedPhoto(null);
              setMessage("");
            }}
          >
            <Text style={styles.buttonText}>Take Another</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <CameraView style={styles.camera} facing="back" ref={cameraRef} />
          <TouchableOpacity style={styles.shutter} onPress={takeAndDetect} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: "cover" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  shutter: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  button: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  result: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    color: "#fff",
    fontSize: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});
