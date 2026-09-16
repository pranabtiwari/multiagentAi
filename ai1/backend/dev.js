import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const services = [
  { name: "GATEWAY", dir: join(__dirname, "gateway"), color: "\x1b[36m" }, // Cyan
  { name: "AUTH   ", dir: join(__dirname, "services/auth"), color: "\x1b[35m" }, // Magenta
  { name: "CHAT   ", dir: join(__dirname, "services/chat"), color: "\x1b[32m" }, // Green
  { name: "AGENT  ", dir: join(__dirname, "services/agent"), color: "\x1b[33m" }, // Yellow
];

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

console.log(`${BOLD}\x1b[34m====================================================${RESET}`);
console.log(`${BOLD}\x1b[34m    🚀 Starting All FreeAI Backend Services...     ${RESET}`);
console.log(`${BOLD}\x1b[34m====================================================${RESET}\n`);

const children = [];

services.forEach(({ name, dir, color }) => {
  const child = spawn("npm", ["run", "dev"], {
    cwd: dir,
    stdio: ["inherit", "pipe", "pipe"],
  });

  children.push({ name, child });

  child.stdout.on("data", (data) => {
    const text = data.toString().trimEnd();
    if (!text) return;
    text.split("\n").forEach((line) => {
      console.log(`${color}${BOLD}[${name}]${RESET} ${line}`);
    });
  });

  child.stderr.on("data", (data) => {
    const text = data.toString().trimEnd();
    if (!text) return;
    text.split("\n").forEach((line) => {
      console.error(`${color}${BOLD}[${name}]${RESET} \x1b[31m${line}${RESET}`);
    });
  });

  child.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.log(`${color}${BOLD}[${name}]${RESET} Stopped (exit code ${code})`);
    }
  });
});

const cleanup = () => {
  console.log(`\n${BOLD}\x1b[31m>>> Gracefully stopping all backend services...${RESET}`);
  children.forEach(({ child }) => {
    try {
      child.kill("SIGTERM");
    } catch (_) {}
  });
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

