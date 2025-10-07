# InfiniteTalk RunPod Serverless 部署

本项目是一个用于在 RunPod Serverless 环境中部署 [InfiniteTalk](https://github.com/Kijai/InfiniteTalk) 的模板。

InfiniteTalk 是一个 AI 模型，可以接收单张肖像图片和语音音频作为输入，生成自然的唇形同步视频，支持无限时长的对话场景。

## ✨ 核心特性

- **无限时长对话**：生成连续的对话视频，没有时长限制
- **高质量唇形同步**：唇部动作与输入音频精确同步
- **实时视频生成**：高速生成与输入音频同步的视频
- **ComfyUI 集成**：基于 ComfyUI 构建，提供灵活的工作流管理
- **多工作流支持**：同时支持图片转视频（I2V）和视频转视频（V2V）工作流
- **单人/多人场景**：处理单人和多人对话场景

## 🚀 RunPod Serverless 模板

本模板包含在 RunPod Serverless Worker 上运行 InfiniteTalk 所需的所有组件。

### 项目文件说明

- **Dockerfile**: 配置环境并安装模型执行所需的所有依赖项
- **handler.py**: 实现 RunPod Serverless 的请求处理函数
- **entrypoint.sh**: Worker 启动时执行初始化任务
- **I2V_single.json**: 图片转视频单人工作流配置
- **I2V_multi.json**: 图片转视频多人工作流配置
- **V2V_single.json**: 视频转视频单人工作流配置
- **V2V_multi.json**: 视频转视频多人工作流配置

## 📝 API 输入格式

`input` 对象必须包含以下字段。图片、视频和音频可以使用**路径、URL 或 Base64** 三种方式输入（每种媒体类型只能选择一种方式）。

```typescript
interface InfiniteTalkInput {
  // 工作流选择参数
  /** 输入类型："image" 表示图片转视频（I2V），"video" 表示视频转视频（V2V）
   * @default "image"
   */
  input_type?: "image" | "video";

  /** 人物数量："single" 表示单人，"multi" 表示多人
   * @default "single"
   */
  person_count?: "single" | "multi";

  // 图片输入（用于 I2V 工作流 - 三选一）
  /** 肖像图片的本地路径
   * @default "/examples/image.jpg"
   */
  image_path?: string;

  /** 肖像图片的 URL
   * @default "/examples/image.jpg"
   */
  image_url?: string;

  /** 肖像图片的 Base64 编码字符串
   * @default "/examples/image.jpg"
   */
  image_base64?: string;

  // 视频输入（用于 V2V 工作流 - 三选一）
  /** 输入视频文件的本地路径
   * @default "/examples/image.jpg"
   */
  video_path?: string;

  /** 输入视频文件的 URL
   * @default "/examples/image.jpg"
   */
  video_url?: string;

  /** 输入视频文件的 Base64 编码字符串
   * @default "/examples/image.jpg"
   */
  video_base64?: string;

  // 音频输入（三选一）
  /** 音频文件的本地路径（支持 WAV/MP3 格式）
   * @default "/examples/audio.mp3"
   */
  wav_path?: string;

  /** 音频文件的 URL（支持 WAV/MP3 格式）
   * @default "/examples/audio.mp3"
   */
  wav_url?: string;

  /** 音频文件的 Base64 编码字符串（支持 WAV/MP3 格式）
   * @default "/examples/audio.mp3"
   */
  wav_base64?: string;

  // 多人音频输入（用于多人工作流 - 三选一）
  /** 多人场景的第二个音频文件本地路径
   * @default 与第一个音频相同
   */
  wav_path_2?: string;

  /** 多人场景的第二个音频文件 URL
   * @default 与第一个音频相同
   */
  wav_url_2?: string;

  /** 多人场景的第二个音频文件 Base64 编码字符串
   * @default 与第一个音频相同
   */
  wav_base64_2?: string;

  // 其他参数
  /** 要生成视频的描述文本
   * @default "A person talking naturally"
   */
  prompt?: string;

  /** 输出视频的宽度（像素）
   * @default 512
   */
  width?: number;

  /** 输出视频的高度（像素）
   * @default 512
   */
  height?: number;
}
```

## 📤 请求示例

### 1. I2V 单人（图片转视频单人）

```json
{
  "input": {
    "input_type": "image",
    "person_count": "single",
    "prompt": "一个人正在自然地说话",
    "image_url": "https://example.com/portrait.jpg",
    "wav_url": "https://example.com/audio.wav",
    "width": 512,
    "height": 512
  }
}
```

### 2. I2V 多人（图片转视频多人）

```json
{
  "input": {
    "input_type": "image",
    "person_count": "multi",
    "prompt": "两个人正在对话",
    "image_url": "https://example.com/portrait.jpg",
    "wav_url": "https://example.com/audio1.wav",
    "wav_url_2": "https://example.com/audio2.wav",
    "width": 512,
    "height": 512
  }
}
```

### 3. V2V 单人（视频转视频单人）

```json
{
  "input": {
    "input_type": "video",
    "person_count": "single",
    "prompt": "一个人正在唱歌",
    "video_url": "https://example.com/input_video.mp4",
    "wav_url": "https://example.com/audio.wav",
    "width": 512,
    "height": 512
  }
}
```

### 4. V2V 多人（视频转视频多人）

```json
{
  "input": {
    "input_type": "video",
    "person_count": "multi",
    "prompt": "两个人在视频中对话",
    "video_url": "https://example.com/input_video.mp4",
    "wav_url": "https://example.com/audio1.wav",
    "wav_url_2": "https://example.com/audio2.wav",
    "width": 512,
    "height": 512
  }
}
```

### 5. 使用 Base64（I2V 单人示例）

```json
{
  "input": {
    "input_type": "image",
    "person_count": "single",
    "prompt": "一个人正在自然地说话",
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "wav_base64": "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    "width": 512,
    "height": 512
  }
}
```

### 6. 使用本地路径（V2V 单人示例）

```json
{
  "input": {
    "input_type": "video",
    "person_count": "single",
    "prompt": "一个人正在自然地说话",
    "video_path": "/my_volume/input_video.mp4",
    "wav_path": "/my_volume/audio.wav",
    "width": 512,
    "height": 512
  }
}
```

## 📦 输出格式

### 成功响应

如果任务成功，返回包含生成视频的 Base64 编码的 JSON 对象。

```typescript
interface SuccessResponse {
  /** Base64 编码的视频文件数据 */
  video: string;
}
```

**成功响应示例：**

```json
{
  "video": "data:video/mp4;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
}
```

### 错误响应

如果任务失败，返回包含错误消息的 JSON 对象。

```typescript
interface ErrorResponse {
  /** 发生的错误描述 */
  error: string;
}
```

**错误响应示例：**

```json
{
  "error": "Video not found."
}
```

## 🛠️ 使用方法和 API 参考

1. 基于此仓库在 RunPod 上创建 Serverless Endpoint
2. 构建完成并且 endpoint 处于活动状态后，通过 HTTP POST 请求提交任务

### 📁 使用 Network Volumes

除了直接传输 Base64 编码的文件，你还可以使用 RunPod 的 Network Volumes 来处理大文件。这对于处理大型图片或音频文件特别有用。

1. **创建并连接 Network Volume**: 从 RunPod 控制台创建 Network Volume（例如基于 S3 的卷）并在 Serverless Endpoint 设置中连接它
2. **上传文件**: 将要使用的图片和音频文件上传到创建的 Network Volume
3. **指定路径**: 在发送 API 请求时，为 `image_path` 和 `wav_path` 指定 Network Volume 中的文件路径。例如，如果卷挂载在 `/my_volume` 并且你使用 `portrait.jpg`，路径应该是 `"/my_volume/portrait.jpg"`

## 🔧 工作流配置

本模板包含四个工作流配置，会根据你的输入参数自动选择：

- **I2V_single.json**: 图片转视频单人工作流
- **I2V_multi.json**: 图片转视频多人工作流
- **V2V_single.json**: 视频转视频单人工作流
- **V2V_multi.json**: 视频转视频多人工作流

### 工作流选择逻辑

Handler 会根据你的输入参数自动选择适当的工作流：

```typescript
type WorkflowConfig = {
  input_type: "image";
  person_count: "single";
  workflow: "I2V_single.json";
} | {
  input_type: "image";
  person_count: "multi";
  workflow: "I2V_multi.json";
} | {
  input_type: "video";
  person_count: "single";
  workflow: "V2V_single.json";
} | {
  input_type: "video";
  person_count: "multi";
  workflow: "V2V_multi.json";
};
```

这些工作流基于 ComfyUI，包含 InfiniteTalk 处理所需的所有节点。每个工作流都针对其特定用例进行了优化，并包含适当的模型配置。

## 🙏 原始项目

本项目基于以下原始仓库。模型和核心逻辑的所有权利归原作者所有。

- **InfiniteTalk**: [https://github.com/MeiGen-AI/InfiniteTalk](https://github.com/MeiGen-AI/InfiniteTalk)
- **ComfyUI**: [https://github.com/comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI)
- **WanVideoWrapper**: [https://github.com/kijai/ComfyUI-WanVideoWrapper](https://github.com/kijai/ComfyUI-WanVideoWrapper)

## 📄 许可证

原始 InfiniteTalk 项目遵循 Apache 2.0 许可证。本模板也遵守该许可证。
