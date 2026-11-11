import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CACHE_FILE = path.join(os.tmpdir(), "meet-portfolio-coding-stats-cache-v1.json");
const memoryCache = new Map<string, unknown>();
let diskCacheDisabled = typeof process !== "undefined" && Boolean(process.env.NODE_TEST_CONTEXT);

function readDiskStore(): Record<string, unknown> {
  if (diskCacheDisabled || typeof window !== "undefined") return {};
  try {
    if (!fs.existsSync(CACHE_FILE)) return {};
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function writeDiskStore(store: Record<string, unknown>): void {
  if (diskCacheDisabled || typeof window !== "undefined") return;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(store), "utf8");
  } catch {
    // Serverless or read-only filesystem: memory cache remains active for the worker lifetime.
  }
}

export function getLastGoodCachedStat<T>(key: string): T | null {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  const disk = readDiskStore();
  if (key in disk && disk[key] != null) {
    memoryCache.set(key, disk[key]);
    return disk[key] as T;
  }
  return null;
}

export function setLastGoodCachedStat<T>(key: string, value: T): void {
  memoryCache.set(key, value);
  const disk = readDiskStore();
  disk[key] = value;
  writeDiskStore(disk);
}

export function clearCodingStatsCacheForTests(disableDisk = true): void {
  memoryCache.clear();
  diskCacheDisabled = disableDisk;
}

export function setDiskCacheEnabledForTests(enabled: boolean): void {
  diskCacheDisabled = !enabled;
}
