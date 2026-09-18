import { useState } from "react";
import { Check, Copy, Code, Terminal, FileCode } from "lucide-react";

export const CodeBlock = ({ language = "code", filename = null, code = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950/90 shadow-2xl font-mono text-xs sm:text-sm">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/90 border-b border-neutral-800/80 text-neutral-400">
        <div className="flex items-center gap-2">
          {filename ? (
            <>
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-neutral-200">{filename}</span>
            </>
          ) : (
            <>
              <Code className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-medium lowercase">{language || "code"}</span>
            </>
          )}
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content Container */}
      <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-800 text-neutral-100 leading-relaxed">
        <pre className="m-0 p-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const ArtifactViewer = ({ artifact }) => {
  const files = artifact?.files || [];
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const currentFile = files[activeFileIndex] || files[0] || {
    filename: "code.txt",
    content: typeof artifact === "string" ? artifact : JSON.stringify(artifact, null, 2),
  };

  return (
    <div className="my-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-2xl overflow-hidden font-sans">
      {/* Artifact Title & Info */}
      {(artifact?.title || artifact?.description) && (
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/40">
          {artifact.title && (
            <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              {artifact.title}
            </h3>
          )}
          {artifact.description && (
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {artifact.description}
            </p>
          )}
          {Array.isArray(artifact.dependencies) && artifact.dependencies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[11px] font-medium text-neutral-400">Dependencies:</span>
              {artifact.dependencies.map((dep, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700/60 text-[11px] font-mono text-purple-300"
                >
                  {dep}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Multiple Files Tabs */}
      {files.length > 1 && (
        <div className="flex items-center gap-1 px-3 pt-2 bg-neutral-950/80 border-b border-neutral-800 overflow-x-auto scrollbar-none">
          {files.map((f, index) => {
            const isActive = index === activeFileIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveFileIndex(index)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-mono transition cursor-pointer border-t border-x ${
                  isActive
                    ? "bg-neutral-900 border-neutral-700 text-white font-semibold"
                    : "bg-transparent border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>{f.filename || f.name || `file-${index + 1}`}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Code Box for Selected File */}
      <div className="px-3 py-1">
        <CodeBlock
          filename={currentFile.filename || currentFile.name || artifact.language}
          language={artifact?.language || "code"}
          code={currentFile.content || ""}
        />
      </div>

      {/* Run & Test Instructions */}
      {((Array.isArray(artifact?.runInstructions) && artifact.runInstructions.length > 0) ||
        (Array.isArray(artifact?.testInstructions) && artifact.testInstructions.length > 0)) && (
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/40 text-xs space-y-2">
          {Array.isArray(artifact?.runInstructions) && artifact.runInstructions.length > 0 && (
            <div>
              <p className="font-semibold text-neutral-300 mb-1">🚀 How to Run:</p>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-400 font-mono">
                {artifact.runInstructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(artifact?.testInstructions) && artifact.testInstructions.length > 0 && (
            <div className="pt-1">
              <p className="font-semibold text-neutral-300 mb-1">🧪 Testing:</p>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-400 font-mono">
                {artifact.testInstructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

