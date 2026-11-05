import path from "node:path";

/**
 * Where the disposable demo workspace lives.
 *
 * Locally we keep it inside the project so edits survive restarts. Serverless
 * hosts ship the project directory read-only and expose only the OS temp
 * directory for writes, so Vercel (and similar) deployments use `/tmp`.
 */
export function demoDataDir() {
  return process.env.VERCEL
    ? path.join("/tmp", "lastplate-demo")
    : path.join(process.cwd(), ".data");
}

export function demoUploadsDir() {
  return path.join(demoDataDir(), "uploads");
}
