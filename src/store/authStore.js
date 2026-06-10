import { api } from "@/api/fileDirectoryApi";
import { create } from "zustand";

const useAuthStore = create((set, get) => {
  let currentController = null;

  return {
    user: null,
    loading: true,
    isFetching: false,
    error: null,
    otpSent: false,

    sendOTP: async (email) => {
      try {
        await api.post(`/user/send-otp`, { email });
      } catch (error) {
        set({ error: "Failed to send OTP. Please try again." });
        throw error;
      }
    },

    verifyOTP: async (email, otp) => {
      try {
        await api.post("/user/verify-otp", { email, otp });
      } catch (error) {
        set({ error: error.response?.data?.message || error.message });
        throw error;
      }
    },

    register: async ({ name, email, password }) => {
      set({ loading: true, error: null });
      try {
        const { data } = await api.post(
          "/user/register",
          { name, email, password },
          { withCredentials: true }
        );
        set({ otpSent: true, loading: false });
        return data;
      } catch (err) {
        set({
          error: err.response?.data?.message || err.message,
          loading: false,
        });
        throw err;
      }
    },

    login: async ({ email, password }) => {
      set({ loading: true, error: null });
      try {
        const { data } = await api.post(
          "/user/login",
          { email, password },
          { withCredentials: true }
        );

        // If server returns user directly, set it without extra fetch
        if (data?.user) {
          set({ user: data.user, loading: false });
          return data;
        }

        // Otherwise call the guarded fetchProfile
        await get().fetchProfile();
        return data;
      } catch (err) {
        set({
          error: err.response?.data?.message || err.message,
          loading: false,
          user: null,
        });
        throw err;
      }
    },

    loginWithGoogle: async (idToken) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post(
          "/user/google-auth",
          { idToken },
          { withCredentials: true }
        );

        if (response.data?.user) {
          set({ user: response.data.user, loading: false });
          return response.data;
        }

        // Fallback
        await get().fetchProfile();
        return response.data;
      } catch (error) {
        set({ loading: false, user: null });
        const responseData = error?.response?.data;
        return {
          error: true,
          message:
            responseData?.error ||
            responseData?.message ||
            "Login failed. Please try again later.",
          status: error?.response?.status || 500,
        };
      }
    },

    fetchProfile: async () => {
      // Prevent concurrent calls
      if (get().isFetching) return;
      set({ isFetching: true, loading: true });

      // Abort previous if any
      if (currentController) {
        try {
          currentController.abort();
        } catch (e) {
          // ignore
        }
        currentController = null;
      }
      currentController = new AbortController();
      try {
        const { data } = await api.get("/user/profile", {
          withCredentials: true,
          signal: currentController.signal,
        });
        set({ user: data.user, loading: false, isFetching: false });
        currentController = null;
        return data.user;
      } catch (error) {
        // If aborted, just clear flags
        const isAbort =
          error?.name === "CanceledError" || error?.message === "canceled";
        if (!isAbort) {
          console.error("AuthStore - Fetch profile error:", error);
        }
        set({ user: null, loading: false, isFetching: false });
        currentController = null;
      }
    },

    logout: async () => {
      try {
        await api.post("/user/logout", {}, { withCredentials: true });
      } catch (err) {
        // swallow
      } finally {
        set({ user: null, loading: false });
      }
    },
  };
});

export default useAuthStore;
