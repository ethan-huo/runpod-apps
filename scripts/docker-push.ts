#!/usr/bin/env bun

/**
 * Docker push script - pushes Docker images to Docker Hub
 */

import { $ } from "bun";

const apps = ["seedvr2", "infinitetalk"] as const;
type App = typeof apps[number];

// Get Docker username from environment
const dockerUsername = process.env.DOCKER_USERNAME || "huodong";

// Parse command line arguments
const args = process.argv.slice(2);
const appArg = args[0] as App | "all" | undefined;

if (appArg && appArg !== "all" && !apps.includes(appArg)) {
  console.error(`❌ Invalid app: ${appArg}`);
  console.error(`   Valid options: ${apps.join(", ")}, all`);
  process.exit(1);
}

const appsToPush: App[] =
  !appArg || appArg === "all"
    ? [...apps]
    : [appArg];

console.log(`🐳 Pushing Docker images to ${dockerUsername}/...\n`);

for (const app of appsToPush) {
  const localImageName = app === "infinitetalk"
    ? "infinitetalk-runpod"
    : app;

  const remoteImageName = `${dockerUsername}/${localImageName}`;

  console.log(`📤 Pushing ${app}...`);

  try {
    // Tag the image
    await $`docker tag ${localImageName}:latest ${remoteImageName}:latest`;

    // Push to Docker Hub
    await $`docker push ${remoteImageName}:latest`;

    console.log(`✅ Successfully pushed ${remoteImageName}:latest\n`);
  } catch (error) {
    console.error(`❌ Failed to push ${app}`);
    console.error(error);
    process.exit(1);
  }
}

console.log("✅ All images pushed successfully!");
