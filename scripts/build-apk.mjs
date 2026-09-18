// Builds the Android APK from the already-synced native project and says where
// it landed, because the Gradle output path is several levels deep and nothing
// else in the toolchain prints it.
//
// The Android SDK location is not configured here: Gradle reads it from
// android/local.properties, which is machine-specific and untracked, so this
// script carries no absolute paths.
//
// Usage: node scripts/build-apk.mjs [release]

import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ANDROID_DIR = join(ROOT, "android");

const variant = process.argv[2] === "release" ? "release" : "debug";
const task = variant === "release" ? "assembleRelease" : "assembleDebug";

// The wrapper ships as a shell script and a batch file; only one of them runs
// on any given machine. The batch file goes through cmd explicitly rather than
// spawn's `shell` option: cmd resolves a bare command against PATH, not the
// working directory, so the wrapper has to be named by its full path anyway.
const isWindows = process.platform === "win32";
const wrapper = join(ANDROID_DIR, isWindows ? "gradlew.bat" : "gradlew");

const gradle = isWindows
  ? spawn("cmd.exe", ["/c", wrapper, task], { cwd: ANDROID_DIR, stdio: "inherit" })
  : spawn(wrapper, [task], { cwd: ANDROID_DIR, stdio: "inherit" });

gradle.on("close", async (code) => {
  if (code !== 0) {
    process.exitCode = code ?? 1;
    return;
  }

  const apk = join(
    ANDROID_DIR,
    "app", "build", "outputs", "apk", variant,
    `app-${variant}.apk`,
  );

  try {
    const { size } = await stat(apk);
    const mb = (size / 1024 / 1024).toFixed(1);
    console.log(`\n${variant} APK ready: ${apk} (${mb} MB)`);
  } catch {
    console.log(`\nGradle succeeded but ${apk} is missing.`);
    process.exitCode = 1;
  }
});
