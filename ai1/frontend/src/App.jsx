import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "./feature/getCurrentUser";
import { setUserData } from "./feature/user/userSlice";
import AppRoutes from "./app.routes";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          dispatch(setUserData(user));
        }
        console.log("Current user:", user);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  return (
    <div>
      <AppRoutes />
    </div>
  );
};

export default App;
