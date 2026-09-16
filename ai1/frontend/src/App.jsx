import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase.js";
import instance from "../utils/axios.js";
import { getCurrentUser } from "./feature/getCurrentUser";
import { setUserData } from "./redux/user/userSlice.js";
import AppRoutes from "./app.routes";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Sync with backend and store user profile in Redux
          const idToken = await currentUser.getIdToken();
          const response = await instance.post("/auth/login", {
            idToken,
            name: currentUser.displayName,
          });
          if (response.data?.user) {
            dispatch(setUserData(response.data.user));
          }
        } catch (error) {
          console.error("Session sync failed:", error);
          // Fallback to /me endpoint
          const user = await getCurrentUser();
          if (user) {
            dispatch(setUserData(user));
          }
        }
      } else {
        // Fallback check via cookie /me
        const user = await getCurrentUser();
        if (user) {
          dispatch(setUserData(user));
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div>
      <AppRoutes />
    </div>
  );
};

export default App;
