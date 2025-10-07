# RunPod Integration Tests

Bun-based integration tests for validating RunPod serverless endpoints.

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# RunPod API Key (required)
RUNPOD_API_KEY=your_api_key_here

# SeedVR2 Endpoint ID
SEEDVR2_ENDPOINT_ID=your_seedvr2_endpoint_id

# InfiniteTalk Endpoint ID
INFINITETALK_ENDPOINT_ID=your_infinitetalk_endpoint_id
```

Get your API key from [RunPod Settings](https://www.runpod.io/console/user/settings).

Get your endpoint IDs from the [RunPod Serverless Console](https://www.runpod.io/console/serverless).

## Running Tests

### Test Individual Endpoints

```bash
# Test SeedVR2
bun run src/tests/seedvr2.test.ts

# Test InfiniteTalk
bun run src/tests/infinitetalk.test.ts
```

### Test All Endpoints

```bash
# Run all tests
bun test
```

## Test Coverage

### SeedVR2 Tests

- ✅ **Health Check**: Verify endpoint is online and workers are available
- ⏸️  **Async Run**: Submit job and poll for completion
- ⏸️  **Sync Run**: Wait for immediate result
- ⏸️  **Cancel Job**: Test job cancellation

### InfiniteTalk Tests

- ✅ **Health Check**: Verify endpoint is online and workers are available
- ⏸️  **I2V Single Person**: Image to video with single person
- ⏸️  **V2V Multi Person**: Video to video with multiple people
- ⏸️  **Error Handling**: Validate error responses for invalid input

> **Note**: Tests marked with ⏸️ are commented out until you provide actual test data (images, videos, audio files). Uncomment them in the test files when ready.

## Test Output

Each test provides detailed output:

```
🧪 Testing InfiniteTalk Endpoint
📡 Endpoint ID: abc123xyz

🏥 Test 1: Health Check
✅ Health check passed
{
  "jobs": {
    "completed": 42,
    "failed": 1,
    "inProgress": 2,
    "inQueue": 0,
    "retried": 0
  },
  "workers": {
    "idle": 1,
    "running": 0,
    "throttled": 0
  }
}

===============================================================
📊 Test Results Summary
===============================================================
✅ health
1/1 tests passed

🎉 All tests passed!
```

## Adding New Tests

Create a new test file in `src/tests/`:

```typescript
#!/usr/bin/env bun

import runpodSdk from "runpod-sdk";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY!;
const ENDPOINT_ID = process.env.YOUR_ENDPOINT_ID!;

const runpod = runpodSdk(RUNPOD_API_KEY);
const endpoint = runpod.endpoint(ENDPOINT_ID);

async function testMyFeature() {
  console.log("🧪 Test: My Feature");

  try {
    const result = await endpoint.runSync({
      input: { /* your input */ }
    });

    console.log("✅ Test passed");
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

testMyFeature();
```

## CI/CD Integration

These tests can be integrated into GitHub Actions:

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2

- name: Install dependencies
  run: bun install

- name: Run integration tests
  env:
    RUNPOD_API_KEY: ${{ secrets.RUNPOD_API_KEY }}
    SEEDVR2_ENDPOINT_ID: ${{ secrets.SEEDVR2_ENDPOINT_ID }}
    INFINITETALK_ENDPOINT_ID: ${{ secrets.INFINITETALK_ENDPOINT_ID }}
  run: |
    bun run src/tests/seedvr2.test.ts
    bun run src/tests/infinitetalk.test.ts
```

## Troubleshooting

### "RUNPOD_API_KEY environment variable is required"

Make sure your `.env` file contains `RUNPOD_API_KEY=...`

### "ENDPOINT_ID environment variable is required"

Add the endpoint IDs to your `.env` file after creating endpoints on RunPod.

### Job stuck in "IN_QUEUE"

Your endpoint might not have active workers. Check the endpoint configuration and ensure:
- Workers are available
- GPU resources are allocated
- Endpoint is not paused

### Timeout errors

Increase the timeout values in test files:
- `runSync(input, 180000)` - 3 minutes
- `maxAttempts` in polling loops

## Resources

- [RunPod JS SDK](https://github.com/runpod/js-sdk)
- [RunPod Serverless Docs](https://docs.runpod.io/serverless/overview)
- [Bun Documentation](https://bun.sh/docs)
