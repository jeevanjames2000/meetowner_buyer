import React from "react";
import { NativeBaseProvider } from "native-base";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MainNav from "./screens/Navigations/MainNav";
import { Provider } from "react-redux";
import store from "./store/store";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider>
        <Provider store={store}>
          <MainNav />
        </Provider>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}
