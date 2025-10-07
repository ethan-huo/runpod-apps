# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **RunPod Serverless deployment project** for SeedVR2-3B, a video super-resolution model from ByteDance. **Current state: Template/skeleton - actual model integration is NOT implemented yet.**

Reference model: https://huggingface.co/spaces/ByteDance-Seed/SeedVR2-3B

## Critical Architecture Notes

### RunPod Serverless Handler Pattern
- `handler.py` follows RunPod's serverless worker pattern
- Model loading happens **once at startup** in `load_model()` (called before `runpod.serverless.start()`)
- Handler function receives jobs and returns results synchronously
- Input/output uses base64-encoded video data or URLs

### Network Volume Usage
- Network Volume ID `3uwnzdk192` (seedvr2-models, 50GB, AP-JP-1) configured in `runpod.toml`
- Mount path: `/runpod-volume` - use this for model weight caching
- Storage persists across endpoint cold starts

### Configuration Files
- **`runpod.toml`**: RunPod project configuration (GPU types, storage, endpoint settings)
  - `storage_id`: Must match your Network Volume ID
  - `gpu_types`: Ordered by preference; CLI tries each until one is available
  - `[endpoint]`: Serverless endpoint config (active_workers=0, max_workers=3, flashboot enabled)
- **`.runpod/hub.json`**: RunPod Hub metadata (for publishing to marketplace)
- **`.runpod/tests.json`**: Test cases for automated testing via GitHub Actions or CLI

## Deployment Methods

### Method 1: RunPod CLI (runpodctl)
```bash
# Install CLI
brew install runpod/runpodctl/runpodctl

# Configure with API key
runpodctl config --apiKey=YOUR_API_KEY

# Deploy (requires GPU availability for initial file sync)
runpodctl project deploy
# Note: May fail with "none of the selected GPU types were available"
# This is for the temporary development pod, not the serverless endpoint
```

### Method 2: Docker + RunPod Web Interface (Recommended)
```bash
# Build and push to Docker Hub
docker build -t YOUR_USERNAME/seedvr2:latest .
docker push YOUR_USERNAME/seedvr2:latest

# Then create template and endpoint via web:
# https://www.runpod.io/console/serverless/user/templates
```

### Method 3: GitHub Actions (Automated)
- Workflow: `.github/workflows/deploy.yml`
- Requires secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `RUNPOD_API_KEY`
- Automatically builds, tests, and pushes on push to main

## Critical TODOs for Model Integration

The current `handler.py` is a **skeleton**. To complete the implementation:

1. **Add SeedVR2 model code** in `load_model()`:
   - Clone/adapt code from https://huggingface.co/spaces/ByteDance-Seed/SeedVR2-3B/tree/main
   - Model weights should download to `/runpod-volume` for persistence
   - Use `torch.float16` for GPU inference

2. **Implement video processing** in `handler()`:
   - URL download logic (currently commented out)
   - Actual model inference (replace placeholder at line 90)
   - Proper error handling for large files, unsupported formats, etc.

3. **Update `requirements.txt`**:
   - Add actual SeedVR2 dependencies from HuggingFace Space
   - Current deps are generic placeholders

4. **Test with real workload**:
   - Update `.runpod/tests.json` with real test video URLs
   - Verify memory usage doesn't exceed GPU VRAM

## Environment Setup

API keys are stored in `../.env` (parent directory):
```
RUNPOD_API_KEY=rpa_...
```

Docker Hub credentials configured via:
```bash
echo "TOKEN" | docker login -u USERNAME --password-stdin
```

## GPU Availability Notes

- RunPod CLI `project deploy` requires a temporary development pod for file sync
- If all GPU types unavailable, deployment fails even though serverless endpoints don't need standing pods
- Workaround: Use Docker method instead, which doesn't require dev pod

## Handler API Contract

**Input:**
```json
{
  "input": {
    "video": "base64_encoded_data OR https://url",
    "seed": 42,
    "fps": 30
  }
}
```

**Output:**
```json
{
  "video": "base64_encoded_restored_video",
  "seed": 42,
  "fps": 30
}
```

Error responses: `{"error": "message"}`
