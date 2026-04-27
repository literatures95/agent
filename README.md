# 智能对话系统

基于 LangGraph + edge-tts + OpenAI 构建的具备跨会话记忆、角色扮演和中文语音输出的对话系统，现提供 React + Tauri 桌面前端。

## 功能特点

- **长期记忆系统**: 记录用户偏好、重要事件、知识积累
- **每日记忆**: 自动记录当日对话内容
- **角色扮演**: 拥有完整的人格设定（艾米 - 温暖友好、乐于助人的 AI 助手）
- **智能检索**: 混合关键词匹配和向量相似度的记忆检索
- **语音输出**: 使用 edge-tts 实现中文语音合成
- **跨会话保持**: 基于 LangGraph 的 MemorySaver 保持对话连续性
- **Tauri 桌面应用**: 现代、美观、跨平台的用户界面
- **实时对话**: 流畅的消息交互体验
- **会话管理**: 创建、切换、删除会话
- **记忆查看**: 查看长期记忆和当日记忆
- **语音设置**: 自定义语音音色和语速
- **主题切换**: 支持浅色/深色主题

## 技术栈

### 后端
- **FastAPI**: REST API 框架
- **LangGraph**: 对话流程管理
- **OpenAI GPT-4**: 语言模型和向量嵌入
- **edge-tts**: 微软 Edge TTS 语音合成
- **pygame**: 音频播放
- **python-dotenv**: 环境变量管理

### 前端
- **Tauri**: 跨平台桌面应用框架
- **React 18 + TypeScript**: 现代 UI 框架
- **Vite**: 快速构建工具
- **shadcn/ui + Tailwind CSS**: UI 组件库
- **react-markdown**: Markdown 渲染
- **zustand**: 状态管理

## 快速开始

### 1. 环境配置

```bash
# 安装 Python 依赖
pip install -r requirements.txt

# 配置 API Key
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key

# 安装 Rust 和 Tauri CLI
# 参考: https://tauri.app/v1/guides/getting-started/prerequisites
```

### 2. 启动后端服务

```bash
python api_server.py
```
访问 http://localhost:8000/docs 查看 API 文档

### 3. 启动前端应用

```bash
cd frontend
npm install

# 开发模式
npm run tauri dev

# 构建应用
npm run tauri build
```

### 4. 使用说明

- 左侧边栏管理会话和查看记忆
- 主界面进行对话，支持语音播放
- 右下角可切换主题和调整语音设置
- 使用 Enter 键发送消息，Shift+Enter 换行

### 5. 自定义设置

#### 修改角色人格

编辑 `memory/SOUL.md` 来自定义 AI 助手的人格设定。

#### 修改语音设置

在 `.env` 文件中设置：
```env
EDGE_TTS_VOICE=zh-CN-XiaoyiNeural  # 其他选择：zh-CN-XiaoxiaoNeural, zh-CN-YunyeNeural 等
EDGE_TTS_RATE=0                     # 语速，-100 到 +100
```

#### 查看记忆文件

- `memory/MEMORY.md`: 长期记忆
- `memory/YYYY-MM-DD.md`: 每日记忆

## 项目结构

```
agent/
├── main.py              # 主程序（CLI 模式）
├── api_server.py       # FastAPI 服务（Web 模式）
├── memory_tools.py      # 记忆工具
├── memory/             # 记忆目录
│   ├── MEMORY.md       # 长期记忆
│   ├── SOUL.md         # 角色人格
│   └── 2026-04-27.md   # 每日记忆
├── .env                # 环境变量
├── .env.example        # 环境变量模板
└── requirements.txt    # 依赖列表

frontend/               # Tauri React 前端
├── src/
│   ├── components/     # React 组件
│   ├── hooks/         # 自定义 Hooks
│   ├── lib/          # 工具库
│   └── App.tsx        # 主应用
├── src-tauri/        # Tauri 配置
└── package.json      # 前端依赖
```

## API 端点

- `POST /api/chat`: 发送消息
- `POST /api/chat/voice`: 发送消息并返回音频
- `GET /api/memory/long`: 获取长期记忆
- `GET /api/memory/daily`: 获取当日记忆
- `GET /api/sessions`: 获取会话列表
- `POST /api/sessions`: 创建会话
- `DELETE /api/sessions/{id}`: 删除会话

## 开发指南

### 运行测试

```bash
# 测试后端 API
cd frontend
npm install -g @playwright/test
npx playwright test --headed

# 测试 Python 模块
python test.py
```

### 自定义功能

#### 1. 修改角色人格

编辑 `memory/SOUL.md` 来自定义 AI 助手的人格设定。

#### 2. 添加新工具

在 `api_server.py` 中添加新的 API 端点，更新 `ConversationAgent` 类。

#### 3. 自定义 UI 组件

在 `frontend/src/components/` 中添加新的 React 组件。

#### 4. 添加新的语音音色

在 `.env` 文件中设置：
```env
EDGE_TTS_VOICE=zh-CN-XiaoyiNeural  # 其他选择见文档
EDGE_TTS_RATE=0                     # 语速，-100 到 +100
```

### 部署

#### Docker 部署

```dockerfile
FROM python:3.11
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /app
WORKDIR /app
CMD ["python", "api_server.py"]
```

#### 构建发布版本

```bash
# 构建前端
cd frontend
npm run tauri build

# 生成的应用在 src-tauri/target/release/
```

## 故障排除

1. **语音播放失败**: 检查网络连接和 edge-tts 语音模型
2. **API 调用失败**: 验证 OpenAI API Key 是否正确
3. **构建错误**: 确保已安装 Rust 和 Tauri CLI
4. **内存问题**: 定期清理 `memory/` 目录和音频文件

## 许可证

仅供学习使用。