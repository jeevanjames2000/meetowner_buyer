import { createSlice } from "@reduxjs/toolkit";
const authSlice = createSlice({
  name: "auth",
  initialState: {
    userDetails: [],
    loggedIn: [],
    userImage: [],
    location: "",
    subscriptionDetails: [],
  },
  reducers: {
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    removeUserDetails: (state) => {
      state.userDetails = null;
    },
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setUserImage: (state, action) => {
      state.userImage = action.payload;
    },
    setSubscriptionDetails: (state, action) => {
      state.subscriptionDetails = action.payload;
    },
  },
});
export const {
  setUserDetails,
  removeUserDetails,
  setLoggedIn,
  setLocation,
  setUserImage,
  setSubscriptionDetails,
} = authSlice.actions;
export default authSlice.reducer;
