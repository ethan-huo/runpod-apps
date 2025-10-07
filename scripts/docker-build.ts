#!/usr/bin/env bun

/**
 * Docker build script - builds Docker images for RunPod apps
 */

import { $ } from "bun";

const apps = ["seedvr2", "infinitetalk"] as const;
type App = typeof apps[number];

// Parse command line arguments
const args = process.argv.slice(2);
const appArg = args[0] as App | "all" | undefined;

if (appArg && appArg !== "all" && !apps.includes(appArg)) {
  console.error(`❌ Invalid app: ${appArg}`);
  console.error(`   Valid options: ${apps.join(", ")}, all`);
  process.exit(1);
}

const appsToBuild: App[] =
  !appArg || appArg === "all"
    ? [...apps]
    : [appArg];

console.log("🐳 Building Docker images...\n");

for (const app of appsToBuild) {
  const imageName = app === "infinitetalk"
    ? "infinitetalk-runpod"
    : app;

  console.log(`📦 Building ${app}...`);

  try {
    await $`docker build -t ${imageName}:latest ./${app}`;
    console.log(`✅ Successfully built ${imageName}:latest\n`);
  } catch (error) {
    console.error(`❌ Failed to build ${app}`);
    console.error(error);
    process.exit(1);
  }
}

console.log("✅ All images built successfully!");
