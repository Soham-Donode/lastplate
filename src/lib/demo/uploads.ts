import "server-only";
import { mkdir, open, readFile } from "node:fs/promises";
import path from "node:path";
import { demoUploadsDir } from "./paths";

export async function saveDemoUpload(name: string, contents: Uint8Array) {
  const directory = demoUploadsDir();
  await mkdir(directory, { recursive: true });

  const file = await open(path.join(directory, name), "wx");
  try {
    await file.writeFile(contents);
  } finally {
    await file.close();
  }
}

export function readDemoUpload(name: string) {
  return readFile(path.join(demoUploadsDir(), name));
}
