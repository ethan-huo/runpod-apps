# Bun Scripts

This directory contains Bun TypeScript scripts for managing the RunPod applications.

## Available Scripts

### `check.ts`
Validates project configuration and environment.

```bash
bun run scripts/check.ts
# or
bun run check
```

Checks:
- Required directories exist (infinitetalk, .github/workflows)
- Required files exist (Dockerfiles, handlers, READMEs)
- Environment variables are configured (.env file)

### `docker-build.ts`
Builds Docker images for RunPod applications.

```bash
# Build all apps
bun run scripts/docker-build.ts
bun run docker:build

# Build specific app
bun run scripts/docker-build.ts infinitetalk
bun run docker:build infinitetalk
```

### `docker-push.ts`
Pushes Docker images to Docker Hub.

```bash
# Push all apps
bun run scripts/docker-push.ts
bun run docker:push

# Push specific app
bun run scripts/docker-push.ts infinitetalk
bun run docker:push infinitetalk
```

**Note**: Set `DOCKER_USERNAME` environment variable or it defaults to `huodong`.

## Writing New Scripts

All scripts use Bun's runtime and APIs:

```typescript
#!/usr/bin/env bun

import { $ } from "bun";

// Run shell commands
await $`docker build -t myapp .`;

// File operations
const file = Bun.file("path/to/file");
const exists = await file.exists();
const content = await file.text();

// Environment variables
const apiKey = process.env.RUNPOD_API_KEY;
```

## Why Bun?

- **Fast**: Built-in TypeScript support, no compilation step
- **Simple**: Native shell command integration with `$`
- **Modern**: ES modules, top-level await, built-in APIs
- **Unified**: Single runtime for scripts, tests, and builds

## CI/CD Integration

All GitHub Actions jobs automatically set up Bun using `oven-sh/setup-bun@v2`, making these scripts available in CI/CD pipelines.
