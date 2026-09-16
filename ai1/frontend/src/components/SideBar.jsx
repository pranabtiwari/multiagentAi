import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import {
  PanelLeftClose,
  PanelLeft,
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  Bot,
  LogOut,
  Sparkles,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase.js";
import instance from "../../utils/axios.js";
import { clearUserData } from "../redux/user/userSlice.js";
import { createConversation, getConversations } from "../feature/Converations.js";
import { setConverstions } from "../redux/coverstaionSlice.js";

const SideBar = ({
  conversations = [],
  activeConversationId = null,
  onSelectConversation = () => {},
  onNewChat = () => {},
  onDeleteConversation = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const data = async() =>{
      const result = await getConversations()
      dispatch(setConverstions)
    }

    data()
  },[])

  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await instance.post("/auth/logout");
      dispatch(clearUserData());
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`h-screen fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-neutral-950 border-r border-neutral-800/80 transition-all duration-300 ease-in-out select-none ${
          isOpen ? "w-64 sm:w-72" : "w-16"
        }`}
      >
        {/* Header: Brand & Collapse Button */}
        <div className="flex items-center justify-between h-16 px-3.5 border-b border-neutral-800/60">
          {isOpen ? (
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="lg:hidden w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                freeAi
              </span>
            </Link>
          ) : (
            <div className="relative w-8 h-8 group">
              {/* Sparkles icon */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:opacity-0 transition-opacity">
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              {/* Panel Open icon - appears on hover */}
              <button
                onClick={() => setIsOpen(true)}
                className="absolute inset-0 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Sidebar close button */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition cursor-pointer"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className={`w-full flex items-center justify-center gap-2.5 py-2.5 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition active:scale-[0.98] cursor-pointer ${
              !isOpen && "px-0"
            }`}
            title="New Chat"
            onClick={createConversation}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isOpen && <span>New Chat</span>}
          </button>
        </div>

        {/* Conversation List / Recent Chats */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-800">
          {isOpen && (
            <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Recent Chats
            </div>
          )}

          {conversations.length > 0
            ? conversations.map((chat) => {
                const isActive = activeConversationId === chat._id;
                return (
                  <div
                    key={chat._id}
                    onClick={() => onSelectConversation(chat._id)}
                    className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition cursor-pointer ${
                      isActive
                        ? "bg-neutral-800/90 text-white font-medium shadow-xs"
                        : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                    }`}
                    title={chat.title || "Untitled Chat"}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-indigo-400" />
                    {isOpen && (
                      <>
                        <span className="flex-1 truncate">
                          {chat.title || "New Chat"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(chat._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 rounded-md transition"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            : isOpen && (
                <div className="px-3 py-6 text-center text-xs text-neutral-500">
                  No recent conversations.
                </div>
              )}
        </div>

        {/* Navigation Section */}
        <div className="px-2 py-2 border-t border-neutral-800/60 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition"
            title="Agents"
          >
            <Bot className="w-4 h-4 shrink-0 text-purple-400" />
            {isOpen && <span>Multi-Agent Hub</span>}
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition"
            title="Settings"
          >
            <Settings className="w-4 h-4 shrink-0 text-neutral-400" />
            {isOpen && <span>Settings</span>}
          </Link>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-neutral-800/60 bg-neutral-950/80">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-neutral-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                {isOpen && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-neutral-200 truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>

              {isOpen && (
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            isOpen && (
              <Link
                to="/login"
                className="block text-center w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 rounded-xl border border-neutral-800 transition"
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </aside>
    </>
  );
};

export default SideBar;
