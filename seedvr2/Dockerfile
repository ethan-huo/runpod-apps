# Use RunPod PyTorch base image (includes PyTorch, CUDA, and common ML libraries)
FROM runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04

# Set working directory
WORKDIR /app

# Install system dependencies for video processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install only additional dependencies
# (PyTorch and CUDA libs are already in the base image)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir \
    runpod~=1.7.9 \
    transformers>=4.38.2 \
    diffusers>=0.29.1 \
    accelerate>=0.27.0 \
    opencv-python>=4.9.0 \
    mediapy>=1.1.9 \
    imageio>=2.31.1 \
    imageio-ffmpeg>=0.4.9 \
    huggingface-hub>=0.20.0

# Copy handler
COPY handler.py /app/handler.py

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the handler
CMD ["python", "-u", "/app/handler.py"]
