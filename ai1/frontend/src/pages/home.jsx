import SideBar from "../components/SideBar.jsx";
import { useSelector } from "react-redux";

const Home = () => {
  const user = useSelector((state) => state.user.userData);

  return (
    <main>
      <SideBar />
    </main>
  );
};

export default Home;
