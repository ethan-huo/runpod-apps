# SeedVR2 RunPod Serverless Deployment

This project deploys the SeedVR2 video super-resolution model to RunPod Serverless.

## Overview

SeedVR2 is a one-step video and image restoration model using diffusion adversarial post-training. It supports:
- Video restoration up to 720p (121 frames)
- Image restoration up to 2K resolution

## Project Structure

```
seedvr2/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD workflow
├── .runpod/
│   ├── hub.json            # RunPod Hub metadata
│   └── tests.json          # Test cases configuration
├── handler.py              # RunPod serverless handler
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker image configuration
├── test_input.json         # Sample test input
├── .dockerignore          # Docker build exclusions
├── .gitignore             # Git exclusions
└── README.md              # This file
```

## Setup

### Prerequisites

- RunPod account
- Docker installed (for local testing)
- RunPod CLI (optional, for deployment)

### Local Testing

1. Build the Docker image:
```bash
docker build -t seedvr2 .
```

2. Run locally:
```bash
docker run --gpus all -p 8000:8000 seedvr2
```

## Deployment to RunPod

### Option 1: Using GitHub Actions (Recommended)

This project includes automated CI/CD via GitHub Actions that builds, tests, and pushes your Docker image on every commit.

#### Setup:

1. **Add GitHub Secrets**: Go to your repository Settings → Secrets and variables → Actions, and add:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token
   - `RUNPOD_API_KEY`: Your RunPod API key (get it from [RunPod Settings](https://www.runpod.io/console/user/settings))

2. **Push to GitHub**: The workflow will automatically:
   - Build your Docker image
   - Push to Docker Hub with tags `latest` and `{commit-sha}`
   - Run tests on RunPod infrastructure
   - Notify you of the results

3. **Deploy on RunPod**:
   - Go to RunPod Console → Serverless → Templates
   - Create a new template with your Docker image: `{username}/seedvr2:latest`
   - Create an endpoint using this template

#### Manual Trigger:

You can also manually trigger the workflow from the GitHub Actions tab.

### Option 2: Using RunPod Web Interface

1. Build and push your Docker image to a registry (Docker Hub, etc.)
2. Create a new template on RunPod with your image
3. Deploy an endpoint using the template

### Option 3: Using RunPod CLI

```bash
# Login to RunPod
runpod login

# Deploy the endpoint
runpod deploy
```

## API Usage

### Input Format

```json
{
  "input": {
    "video": "base64_encoded_video_data or video_url",
    "seed": 42,
    "fps": 30
  }
}
```

### Parameters

- `video` (required): Base64 encoded video data or URL to video
- `seed` (optional): Random seed for reproducibility (default: 42)
- `fps` (optional): Output video FPS (default: 30)

### Output Format

```json
{
  "video": "base64_encoded_restored_video",
  "seed": 42,
  "fps": 30
}
```

## Development Notes

### TODO Items

The current implementation is a template that needs to be completed:

1. **Model Integration**: Add actual SeedVR2 model loading code in `handler.py`
2. **Video Processing**: Implement the video restoration pipeline
3. **Model Weights**: Configure model weight downloading/caching
4. **Error Handling**: Enhance error handling for edge cases
5. **Performance**: Optimize batch processing and memory usage

### Model Loading

You'll need to update the `load_model()` function to load the actual SeedVR2 model:

```python
from seedvr2 import VideoRestorer  # Add actual import

def load_model():
    global model, device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = VideoRestorer.from_pretrained(
        "ByteDance-Seed/SeedVR2-3B",
        torch_dtype=torch.float16
    )
    model = model.to(device)
    model.eval()
```

## Resources

- [SeedVR2 Hugging Face Space](https://huggingface.co/spaces/ByteDance-Seed/SeedVR2-3B)
- [RunPod Serverless Documentation](https://docs.runpod.io/serverless/overview)
- [RunPod Handler Functions](https://docs.runpod.io/serverless/workers/handler-functions)

## License

Please check the SeedVR2 model license before commercial use.
