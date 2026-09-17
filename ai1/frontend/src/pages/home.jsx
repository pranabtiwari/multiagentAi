import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SideBar from "../components/SideBar.jsx";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Code,
  Search,
  FileText,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import {
  createConversation,
  getMessages,
  sendMessageToAgent,
} from "../feature/Converations.js";
import {
  addConversation,
  setActiveConversationId,
} from "../redux/coverstaionSlice.js";

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.userData);
  const activeConversationId = useSelector(
    (state) => state.converstions?.activeConversationId,
  );
  const conversations = useSelector(
    (state) => state.converstions?.conversations || [],
  );

  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const activeChat = conversations.find((c) => c._id === activeConversationId);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }
      try {
        const msgs = await getMessages(activeConversationId);
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages([]);
      }
    };

    fetchChatMessages();
  }, [activeConversationId]);

  const handleSend = async (customPrompt) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend || isLoading) return;

    setInputPrompt("");
    setIsLoading(true);

    let currentConvId = activeConversationId;

    try {
      // If no active conversation, create one first
      if (!currentConvId) {
        const newChat = await createConversation(
          promptToSend.slice(0, 30) + (promptToSend.length > 30 ? "..." : ""),
        );
        if (newChat && newChat._id) {
          dispatch(addConversation(newChat));
          dispatch(setActiveConversationId(newChat._id));
          currentConvId = newChat._id;
        }
      }

      // Optimistically add user message
      const tempUserMsg = {
        _id: Date.now().toString(),
        role: "user",
        content: promptToSend,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // Call AI Agent workflow
      const result = await sendMessageToAgent(promptToSend, currentConvId);

      const aiContent =
        result?.message || result?.aiResponse || "No response received.";
      const tempAiMsg = {
        _id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        agentUsed: result?.agentUsed,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempAiMsg]);
    } catch (err) {
      console.error("Failed to process chat message:", err);
      const errorMsg = {
        _id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please ensure all backend services are running.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-indigo-500 selection:text-white">
      {/* Collapsible Left Sidebar */}
      <SideBar />

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-neutral-900/40 relative">
        {/* Message Feed / Welcome Screen */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl  from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight  from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                What can I help you build today?
              </h2>
              <p className="text-neutral-400 text-sm mt-2 max-w-md">
                Chat with specialized agents for Coding, Web Search, PDF
                Analysis, and General Q&A.
              </p>

              {/* Quick Prompt Cards */}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg._id || index}
                    className={`flex gap-3.5 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl  from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? " from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/10"
                          : "bg-neutral-800/90 border border-neutral-700/60 text-neutral-200"
                      }`}
                    >
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {msg.agentUsed && (
                        <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-indigo-400/90 flex items-center gap-1">
                          <span>Agent: {msg.agentUsed}</span>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 text-xs font-bold text-neutral-200 mt-1">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt="User"
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3.5 text-neutral-400">
                  <div className="w-8 h-8 rounded-xl  from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-neutral-800/90 border border-neutral-700/60 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Agent is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or enter a prompt..."
              rows={1}
              disabled={isLoading}
              className="w-full pl-4 pr-14 py-3.5 bg-neutral-900 border border-neutral-700/80 hover:border-neutral-600 focus:border-indigo-500 rounded-2xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition shadow-lg shadow-black/40 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputPrompt.trim() || isLoading}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2  from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:hover:from-indigo-500 disabled:hover:to-purple-600 text-white rounded-xl shadow-md transition cursor-pointer"
              title="Send Prompt"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-center text-[11px] text-neutral-500 mt-2">
            FreeAI multi-agent orchestrator may occasionally make mistakes.
            Verify important information.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
