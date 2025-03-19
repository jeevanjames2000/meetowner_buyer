import { createSlice } from "@reduxjs/toolkit";
const propertySlice = createSlice({
  name: "property",
  initialState: {
    propertyDetails: [],
    liked: [],
    enquireNow: [],
    location: "",
    googleAutoSuggestion: [],
    intrested: [],
  },
  reducers: {
    setPropertyDetails: (state, action) => {
      state.propertyDetails = action.payload;
    },
    removeProperty: (state) => {
      state.propertyDetails = null;
    },
    setLiked: (state, action) => {
      state.liked = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setGoogleAutoSuggestion: (state, action) => {
      state.googleAutoSuggestion = action.payload;
    },
  },
});
export const {
  setPropertyDetails,
  removeProperty,
  setLiked,
  setLocation,
  setGoogleAutoSuggestion,
} = propertySlice.actions;
export default propertySlice.reducer;
