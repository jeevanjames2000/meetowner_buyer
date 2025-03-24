import React, { useEffect, useRef, useState } from "react";
import { NativeBaseProvider } from "native-base";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MainNav from "./screens/Navigations/MainNav";
import { Provider, useDispatch } from "react-redux";
import store, { persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default Channel",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  if (!Device.isDevice) {
    Alert.alert("Error", "Must use a physical device for Push Notifications");
    return null;
  }
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("Error", "Failed to get push token for push notifications!");
      return null;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log("Expo Push Token:", token);
  } catch (error) {
    console.error("Error getting push token:", error);
    Alert.alert("Error", `Failed to get push token: ${error.message}`);
    return null;
  }
  return token;
}
async function sendTestPushNotification(expoPushToken) {
  if (!expoPushToken) {
    console.warn("No push token available for sending notification");
    return;
  }
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Test Notification",
    body: "This is a test push notification from your app!",
    data: { someData: "goes here" },
  };
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    const result = await response.json();
    console.log("Push notification sent:", result);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppContent
              setExpoPushToken={setExpoPushToken}
              expoPushToken={expoPushToken}
              setNotification={setNotification}
              notificationListener={notificationListener}
              responseListener={responseListener}
            />
          </PersistGate>
        </Provider>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}
function AppContent({
  setExpoPushToken,
  expoPushToken,
  setNotification,
  notificationListener,
  responseListener,
}) {
  const dispatch = useDispatch();
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        dispatch(setPushToken(token));
        sendTestPushNotification(token);
      }
    });
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        console.log("Notification received:", notification);
      });
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        const { data } = response.notification.request.content;
        if (data?.screen) {
        }
      });
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [dispatch]);
  return <MainNav />;
}
