import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SideBar from "../components/SideBar.jsx";
import { CodeBlock, ArtifactViewer } from "../components/CodeBlock.jsx";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Code,
  Search,
  FileText,
  Plus,
  Globe,
  Check,
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

const tryParseArtifact = (content) => {
  if (!content || typeof content !== "string") return null;
  const trimmed = content.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      if (
        parsed &&
        (parsed.files ||
          parsed.code ||
          (parsed.title && (parsed.language || parsed.files)))
      ) {
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return null;
};

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.userData);
  const activeConversationId = useSelector(
    (state) => state.converstions?.activeConversationId
  );
  const conversations = useSelector(
    (state) => state.converstions?.conversations || []
  );

  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const popoverRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat = conversations.find((c) => c._id === activeConversationId);

  // Auto-resize textarea height as input content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputPrompt]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          promptToSend.slice(0, 30) + (promptToSend.length > 30 ? "..." : "")
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

      // Format prompt depending on agent mode selected via + popover menu
      const finalPrompt =
        selectedAgent === "search"
          ? `[Search Mode] ${promptToSend}`
          : selectedAgent === "coding"
          ? `[Coding Mode] ${promptToSend}`
          : promptToSend;

      // Call AI Agent workflow
      const result = await sendMessageToAgent(finalPrompt, currentConvId);

      const aiContent =
        result?.message || result?.aiResponse || "No response received.";
      const tempAiMsg = {
        _id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        artifacts: result?.artifact ? [result.artifact] : [],
        agentUsed: result?.agentUsed || selectedAgent,
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
        {/* Top Header */}
        <header className="h-16 border-b border-neutral-800/60 flex items-center justify-between px-6 bg-neutral-950/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-neutral-100 truncate">
                {activeChat?.title || "Multi-Agent AI Assistant"}
              </h1>
              <p className="text-[11px] text-neutral-400">
                Mode: {selectedAgent === "search" ? "🔍 Web Search (Gemini)" : selectedAgent === "coding" ? "💻 Coding Agent" : "✨ Auto-Route"}
              </p>
            </div>
          </div>
        </header>

        {/* Message Feed / Welcome Screen */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                What can I help you build today?
              </h2>
              <p className="text-neutral-400 text-sm mt-2 max-w-md">
                Chat with specialized agents for Coding, Web Search, PDF
                Analysis, and General Q&A.
              </p>


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
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/10"
                          : "bg-neutral-800/90 border border-neutral-700/60 text-neutral-200"
                      }`}
                    >
                      {(() => {
                        const artifact =
                          (Array.isArray(msg.artifacts) && msg.artifacts.length > 0 && msg.artifacts[0]) ||
                          tryParseArtifact(msg.content);

                        if (artifact) {
                          return <ArtifactViewer artifact={artifact} />;
                        }

                        return (
                          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  const isInline = inline || (!match && !String(children).includes("\n"));
                                  if (isInline) {
                                    return (
                                      <code
                                        className="bg-neutral-900/80 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono border border-neutral-700/50"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <CodeBlock
                                      language={match ? match[1] : "code"}
                                      code={String(children).replace(/\n$/, "")}
                                    />
                                  );
                                },
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        );
                      })()}

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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
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
            <div className="relative flex items-center">
              {/* + Icon Button with Popover Popup */}
              <div className="absolute left-3.5 bottom-2.5 z-20" ref={popoverRef}>
                <button
                  type="button"
                  onClick={() => setIsPopoverOpen((prev) => !prev)}
                  className={`p-1.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                    selectedAgent !== "auto"
                      ? "bg-purple-500/20 border-purple-500 text-purple-300"
                      : "bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700/80"
                  }`}
                  title="Tools & Agent Selection"
                >
                  <Plus className={`w-4 h-4 transition-transform duration-200 ${isPopoverOpen ? "rotate-45" : ""}`} />
                </button>

                {/* Popover Menu */}
                {isPopoverOpen && (
                  <div className="absolute bottom-12 left-0 w-64 p-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl shadow-black z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-3 py-2 border-b border-neutral-800/60 mb-1">
                      <p className="text-xs font-semibold text-neutral-300">Choose Mode</p>
                      <p className="text-[10px] text-neutral-500">Select model capability</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAgent("auto");
                        setIsPopoverOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        selectedAgent === "auto"
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                          : "text-neutral-300 hover:bg-neutral-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>Auto-Route (Default)</span>
                      </div>
                      {selectedAgent === "auto" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAgent("search");
                        setIsPopoverOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer mt-1 ${
                        selectedAgent === "search"
                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                          : "text-neutral-300 hover:bg-neutral-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span>Web Search (Gemini)</span>
                      </div>
                      {selectedAgent === "search" && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAgent("coding");
                        setIsPopoverOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer mt-1 ${
                        selectedAgent === "coding"
                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                          : "text-neutral-300 hover:bg-neutral-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Code className="w-4 h-4 text-purple-400" />
                        <span>Coding Agent</span>
                      </div>
                      {selectedAgent === "coding" && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedAgent === "search"
                    ? "Search the web with Gemini..."
                    : selectedAgent === "coding"
                    ? "Ask coding questions or write code..."
                    : "Ask anything or enter a prompt..."
                }
                rows={1}
                disabled={isLoading}
                className="w-full pl-12 pr-14 py-3.5 bg-neutral-900 border border-neutral-700/80 hover:border-neutral-600 focus:border-indigo-500 rounded-2xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 transition-all shadow-lg shadow-black/40 disabled:opacity-50 min-h-[52px] max-h-[200px]"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputPrompt.trim() || isLoading}
                className="absolute right-2.5 bottom-2.5 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:hover:from-indigo-500 disabled:hover:to-purple-600 text-white rounded-xl shadow-md transition cursor-pointer"
                title="Send Prompt"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
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
