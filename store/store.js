import { configureStore } from "@reduxjs/toolkit";
import tabReducer from "./slices/tabSlices";
import favourites from "./slices/favourites";
import propertyDetails from "./slices/propertyDetails";
import authSlice from "./slices/authSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    tab: tabReducer,
    favourites: favourites,
    property: propertyDetails,
  },
});

export default store;
