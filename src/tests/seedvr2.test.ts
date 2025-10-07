#!/usr/bin/env bun

/**
 * Integration tests for SeedVR2 RunPod endpoint
 */

import runpodSdk from "runpod-sdk";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const SEEDVR2_ENDPOINT_ID = process.env.SEEDVR2_ENDPOINT_ID;

if (!RUNPOD_API_KEY) {
  console.error("❌ RUNPOD_API_KEY environment variable is required");
  process.exit(1);
}

if (!SEEDVR2_ENDPOINT_ID) {
  console.error("❌ SEEDVR2_ENDPOINT_ID environment variable is required");
  process.exit(1);
}

console.log("🧪 Testing SeedVR2 Endpoint");
console.log(`📡 Endpoint ID: ${SEEDVR2_ENDPOINT_ID}\n`);

const runpod = runpodSdk(RUNPOD_API_KEY);
const endpoint = runpod.endpoint(SEEDVR2_ENDPOINT_ID);

/**
 * Test 1: Health Check
 */
async function testHealth() {
  console.log("🏥 Test 1: Health Check");
  try {
    const health = await endpoint.health();
    console.log("✅ Health check passed");
    console.log(JSON.stringify(health, null, 2));
    console.log();
    return true;
  } catch (error) {
    console.error("❌ Health check failed:", error);
    console.log();
    return false;
  }
}

/**
 * Test 2: Async Run - Submit job and poll status
 */
async function testAsyncRun() {
  console.log("⚡ Test 2: Async Run (submit + poll status)");

  try {
    const input = {
      input: {
        video: "https://example.com/sample-video.mp4", // Replace with actual test video URL
        seed: 42,
        fps: 30,
      },
    };

    console.log("📤 Submitting job...");
    const result = await endpoint.run(input);
    console.log(`✅ Job submitted with ID: ${result.id}`);
    console.log(`   Status: ${result.status}`);

    // Poll for completion
    console.log("⏳ Polling for job completion...");
    let status = result.status;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    while (status !== "COMPLETED" && status !== "FAILED" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      const statusResponse = await endpoint.status(result.id);
      status = statusResponse.status;
      attempts++;
      console.log(`   [${attempts}] Status: ${status}`);

      if (statusResponse.executionTime) {
        console.log(`   Execution time: ${statusResponse.executionTime}ms`);
      }
    }

    if (status === "COMPLETED") {
      const finalStatus = await endpoint.status(result.id);
      console.log("✅ Job completed successfully");
      console.log(JSON.stringify(finalStatus, null, 2));
      console.log();
      return true;
    } else if (status === "FAILED") {
      console.error("❌ Job failed");
      const finalStatus = await endpoint.status(result.id);
      console.error(JSON.stringify(finalStatus, null, 2));
      console.log();
      return false;
    } else {
      console.error("❌ Job timed out");
      console.log();
      return false;
    }
  } catch (error) {
    console.error("❌ Async run test failed:", error);
    console.log();
    return false;
  }
}

/**
 * Test 3: Sync Run - Wait for completion
 */
async function testSyncRun() {
  console.log("🔄 Test 3: Sync Run (wait for completion)");

  try {
    const input = {
      input: {
        video: "https://example.com/sample-video.mp4", // Replace with actual test video URL
        seed: 123,
        fps: 24,
      },
    };

    console.log("📤 Running synchronous job (timeout: 60s)...");
    const result = await endpoint.runSync(input, 60000); // 60 second timeout

    console.log("✅ Sync run completed");
    console.log(JSON.stringify(result, null, 2));
    console.log();
    return true;
  } catch (error) {
    console.error("❌ Sync run test failed:", error);
    console.log();
    return false;
  }
}

/**
 * Test 4: Cancel Job
 */
async function testCancelJob() {
  console.log("🛑 Test 4: Cancel Job");

  try {
    const input = {
      input: {
        video: "https://example.com/sample-video.mp4",
        seed: 999,
        fps: 30,
      },
    };

    console.log("📤 Submitting job to cancel...");
    const result = await endpoint.run(input);
    console.log(`✅ Job submitted with ID: ${result.id}`);

    // Wait a moment then cancel
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("🛑 Canceling job...");
    const cancelResult = await endpoint.cancel(result.id);
    console.log("✅ Job canceled");
    console.log(JSON.stringify(cancelResult, null, 2));
    console.log();
    return true;
  } catch (error) {
    console.error("❌ Cancel job test failed:", error);
    console.log();
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("=" + "=".repeat(60));
  console.log("🚀 SeedVR2 Integration Tests");
  console.log("=" + "=".repeat(60) + "\n");

  const results = {
    health: await testHealth(),
    // Uncomment when you have actual test data
    // asyncRun: await testAsyncRun(),
    // syncRun: await testSyncRun(),
    // cancel: await testCancelJob(),
  };

  console.log("=" + "=".repeat(60));
  console.log("📊 Test Results Summary");
  console.log("=" + "=".repeat(60));

  const passed = Object.values(results).filter((r) => r === true).length;
  const total = Object.keys(results).length;

  for (const [test, result] of Object.entries(results)) {
    console.log(`${result ? "✅" : "❌"} ${test}`);
  }

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log("❌ Some tests failed");
    process.exit(1);
  }
}

// Run tests
runAllTests();
