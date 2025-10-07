#!/usr/bin/env bun

/**
 * Integration tests for InfiniteTalk RunPod endpoint
 */

import runpodSdk from "runpod-sdk";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const INFINITETALK_ENDPOINT_ID = process.env.INFINITETALK_ENDPOINT_ID;

if (!RUNPOD_API_KEY) {
  console.error("❌ RUNPOD_API_KEY environment variable is required");
  process.exit(1);
}

if (!INFINITETALK_ENDPOINT_ID) {
  console.error("❌ INFINITETALK_ENDPOINT_ID environment variable is required");
  process.exit(1);
}

console.log("🧪 Testing InfiniteTalk Endpoint");
console.log(`📡 Endpoint ID: ${INFINITETALK_ENDPOINT_ID}\n`);

const runpod = runpodSdk(RUNPOD_API_KEY);
const endpoint = runpod.endpoint(INFINITETALK_ENDPOINT_ID);

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
 * Test 2: Image to Video (Single Person)
 */
async function testI2VSingle() {
  console.log("🎬 Test 2: Image to Video (Single Person)");

  try {
    const input = {
      input: {
        input_type: "image",
        person_count: "single",
        prompt: "一个人正在说话",
        image_url: "https://example.com/person.jpg", // Replace with actual test image
        wav_url: "https://example.com/audio.wav", // Replace with actual test audio
        width: 512,
        height: 512,
      },
    };

    console.log("📤 Submitting I2V single person job...");
    const result = await endpoint.run(input);
    console.log(`✅ Job submitted with ID: ${result.id}`);
    console.log(`   Status: ${result.status}`);

    // Poll for completion
    console.log("⏳ Polling for job completion...");
    let status = result.status;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes with 5-second intervals

    while (status !== "COMPLETED" && status !== "FAILED" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
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
    console.error("❌ I2V single person test failed:", error);
    console.log();
    return false;
  }
}

/**
 * Test 3: Video to Video (Multi Person)
 */
async function testV2VMulti() {
  console.log("🎥 Test 3: Video to Video (Multi Person)");

  try {
    const input = {
      input: {
        input_type: "video",
        person_count: "multi",
        prompt: "多人对话场景",
        video_url: "https://example.com/video.mp4", // Replace with actual test video
        wav_url: "https://example.com/audio.wav", // Replace with actual test audio
        width: 512,
        height: 512,
      },
    };

    console.log("📤 Running V2V multi person job (sync)...");
    const result = await endpoint.runSync(input, 180000); // 3 minute timeout

    console.log("✅ V2V multi person completed");
    console.log(JSON.stringify(result, null, 2));
    console.log();
    return true;
  } catch (error) {
    console.error("❌ V2V multi person test failed:", error);
    console.log();
    return false;
  }
}

/**
 * Test 4: Error Handling - Invalid Input
 */
async function testInvalidInput() {
  console.log("⚠️  Test 4: Error Handling - Invalid Input");

  try {
    const input = {
      input: {
        // Missing required fields
        input_type: "image",
      },
    };

    console.log("📤 Submitting invalid job...");
    const result = await endpoint.run(input);

    // Check if it fails as expected
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const status = await endpoint.status(result.id);

    if (status.status === "FAILED") {
      console.log("✅ Invalid input correctly rejected");
      console.log(JSON.stringify(status, null, 2));
      console.log();
      return true;
    } else {
      console.error("❌ Invalid input should have failed");
      console.log();
      return false;
    }
  } catch (error) {
    // Expected to fail
    console.log("✅ Invalid input correctly rejected (caught exception)");
    console.log();
    return true;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("=" + "=".repeat(60));
  console.log("🚀 InfiniteTalk Integration Tests");
  console.log("=" + "=".repeat(60) + "\n");

  const results = {
    health: await testHealth(),
    // Uncomment when you have actual test data
    // i2vSingle: await testI2VSingle(),
    // v2vMulti: await testV2VMulti(),
    // invalidInput: await testInvalidInput(),
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
