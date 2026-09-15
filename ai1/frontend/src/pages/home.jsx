import NavBar from "../components/NavBar.jsx";
import { useSelector } from "react-redux";

const Home = () => {
  const user = useSelector((state) => state.user.userData);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome to freeAi{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl">
            Your multi-agent workspace is ready. Start by building, orchestrating, or managing your AI agents.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
