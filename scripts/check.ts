#!/usr/bin/env bun

/**
 * Check script - validates project configuration and environment
 */

console.log("🔍 Checking RunPod Apps configuration...\n");

// Check for required directories
import { existsSync } from "fs";

const requiredDirs = ["seedvr2", "infinitetalk", ".github/workflows"];
const missingDirs: string[] = [];

for (const dir of requiredDirs) {
  const exists = existsSync(dir);
  if (!exists) {
    missingDirs.push(dir);
    console.log(`❌ Missing directory: ${dir}`);
  } else {
    console.log(`✅ Found directory: ${dir}`);
  }
}

// Check for required files
const requiredFiles = [
  "README.md",
  "QUICKSTART.md",
  ".gitignore",
  ".github/workflows/deploy-runpod-apps.yml",
  "seedvr2/Dockerfile",
  "seedvr2/handler.py",
  "infinitetalk/Dockerfile",
  "infinitetalk/handler.py",
];

const missingFiles: string[] = [];

console.log("\n");
for (const file of requiredFiles) {
  const exists = await Bun.file(file).exists();
  if (!exists) {
    missingFiles.push(file);
    console.log(`❌ Missing file: ${file}`);
  } else {
    console.log(`✅ Found file: ${file}`);
  }
}

// Check environment variables
console.log("\n🔑 Checking environment variables...");
const envFile = Bun.file(".env");
if (await envFile.exists()) {
  console.log("✅ .env file exists");
  const envContent = await envFile.text();

  const requiredEnvVars = ["RUNPOD_API_KEY"];
  for (const envVar of requiredEnvVars) {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} is configured`);
    } else {
      console.log(`⚠️  ${envVar} not found in .env`);
    }
  }
} else {
  console.log("⚠️  .env file not found");
}

// Summary
console.log("\n" + "=".repeat(50));
if (missingDirs.length === 0 && missingFiles.length === 0) {
  console.log("✅ All checks passed!");
  process.exit(0);
} else {
  console.log("❌ Some checks failed:");
  if (missingDirs.length > 0) {
    console.log(`   Missing directories: ${missingDirs.join(", ")}`);
  }
  if (missingFiles.length > 0) {
    console.log(`   Missing files: ${missingFiles.join(", ")}`);
  }
  process.exit(1);
}
