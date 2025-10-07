# Use RunPod base image with CUDA support
FROM runpod/base:0.6.3-cuda12.1.0

# Set working directory
WORKDIR /app

# Set Python 3.11 as default
RUN ln -sf $(which python3.11) /usr/local/bin/python && \
    ln -sf $(which python3.11) /usr/local/bin/python3

# Install uv - fast Python package installer
RUN pip install uv

# Install system dependencies for video processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies using uv (much faster than pip)
COPY requirements.txt /app/requirements.txt
RUN uv pip install --system --no-cache-dir -r /app/requirements.txt

# Copy handler
COPY handler.py /app/handler.py

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the handler
CMD ["python", "-u", "/app/handler.py"]
