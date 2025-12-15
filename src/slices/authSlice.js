import { createSlice } from "@reduxjs/toolkit";

// Helper function to safely get token from localStorage
const getTokenFromStorage = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    // Token might be stored as JSON string or plain string
    const parsed = JSON.parse(token);
    return parsed;
  } catch (error) {
    // If parsing fails, return the raw token (might already be a string)
    return localStorage.getItem("token");
  }
};

const initialState = {
  signupData: null,
  loading: false,
  token: getTokenFromStorage(),
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
    },
  },
});

export const { setSignupData, setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;
