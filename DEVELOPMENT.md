# 开发指南

## 项目架构

### 整体架构
```
┌─────────────────────────────────────┐
│     Tauri Desktop Application      │
│  ┌──────────────────────────────┐  │
│  │  React + TypeScript 前端      │  │
│  │  - shadcn/ui 组件            │  │
│  │  - Tailwind CSS              │  │
│  │  - Vite 构建                 │  │
│  └──────────────────────────────┘  │
│            │ HTTP                    │
│            ▼                        │
│     FastAPI REST API                │
│            │                        │
│  ┌──────────────────────────────┐  │
│  │  Python LangGraph 后端       │  │
│  │  - 记忆系统                 │  │
│  │  - TTS 语音                 │  │
│  │  - 对话管理                 │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 开发环境设置

### 1. 后端开发

#### 安装 Python 依赖
```bash
pip install -r requirements.txt
```

#### 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key
```

#### 运行开发服务器
```bash
python api_server.py
```
访问 http://localhost:8000/docs 查看 API 文档

#### 单元测试
```bash
python test.py
```

### 2. 前端开发

#### 安装依赖
```bash
cd frontend
npm install
```

#### 开发模式
```bash
# Tauri 开发模式（需要 Rust 环境）
npm run tauri dev

# 仅 React 开发模式
npm run dev
```

#### 构建应用
```bash
npm run tauri build
```
生成的应用在 `src-tauri/target/release/` 目录

## 代码结构详解

### 后端代码结构
```
backend/
├── api_server.py          # FastAPI 主应用
├── main.py                # CLI 对话系统
├── memory_tools.py        # 记忆管理工具
├── memory/                # 记忆文件
│   ├── MEMORY.md         # 长期记忆
│   ├── SOUL.md           # 角色人格
│   └── YYYY-MM-DD.md     # 每日记忆
└── requirements.txt       # Python 依赖
```

API 端点说明：
- `POST /api/chat`: 发送消息，返回 AI 回复
- `POST /api/chat/voice`: 发送消息，返回 AI 回复 + 音频流
- `GET /api/memory/long`: 获取长期记忆
- `GET /api/memory/daily`: 获取当日记忆
- `GET /api/sessions`: 获取会话列表
- `POST /api/sessions`: 创建新会话
- `DELETE /api/sessions/{id}`: 删除会话（默认会话除外）

### 前端代码结构
```
frontend/
├── src/
│   ├── components/         # React 组件
│   │   ├── ui/           # 基础 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── scroll-area.tsx
│   │   ├── App.tsx       # 主应用组件
│   │   ├── ChatInput.tsx # 聊天输入框
│   │   ├── MessageList.tsx # 消息列表
│   │   ├── MessageBubble.tsx # 消息气泡
│   │   ├── Sidebar.tsx   # 侧边栏
│   │   ├── MemoryViewer.tsx # 记忆查看器
│   │   ├── AudioPlayer.tsx # 音频播放器
│   │   └── SettingsPanel.tsx # 设置面板
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/             # 工具库
│   │   └── api.ts       # API 封装
│   ├── types.ts         # TypeScript 类型定义
│   ├── App.tsx          # 应用入口
│   └── main.tsx         # React 入口
├── src-tauri/           # Tauri 配置
│   ├── src/main.rs      # Tauri 主程序
│   └── tauri.conf.json  # Tauri 配置
├── package.json         # 前端依赖
└── vite.config.ts       # Vite 配置
```

## 开发工作流

### 1. 添加新功能

#### 后端新功能
1. 在 `api_server.py` 中添加新的 API 端点
2. 更新 `ConversationAgent` 类逻辑
3. 更新类型定义（如果需要）

#### 前端新功能
1. 在 `src/components/` 中创建新组件
2. 在 `src/types.ts` 中定义类型
3. 更新 `src/lib/api.ts` 添加新的 API 调用
4. 在 App.tsx 中集成新功能

### 2. 调试技巧

#### 后端调试
```bash
# 启用调试模式
uvicorn api_server:app --reload --log-level debug
```

#### 前端调试
```bash
# 开启 React 严格模式
npm run dev

# 使用浏览器开发者工具
# 网络面板查看 API 请求
# 控制台查看错误信息
```

### 3. 性能优化

#### 后端优化
- 使用异步处理长耗时任务
- 添加缓存层减少 API 调用
- 优化记忆检索算法

#### 前端优化
- 使用 React.memo 优化组件渲染
- 使用 useMemo 和 useCallback 优化性能
- 实现虚拟滚动优化长列表

## 部署指南

### 1. 本地构建

#### 构建 Tauri 应用
```bash
cd frontend
npm install
npm run tauri build
```

#### 打包成安装程序
```bash
# Windows
src-tauri/target/release/bundle/msi/amy_chat_app_1.0.0_x64_en-US.msi

# macOS
src-tauri/target/release/bundle/osx/amy_chat_app_1.0.0.app

# Linux
src-tauri/target/release/bundle/appimage/amy_chat_app_1.0.0.AppImage
```

### 2. 云部署

#### Docker 部署
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . /app
EXPOSE 8000

CMD ["python", "api_server.py"]
```

#### 使用 Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      
  frontend:
    build: ./frontend
    ports:
      - "1420:1420"
    depends_on:
      - backend
```

### 3. CI/CD 配置

#### GitHub Actions 示例
```yaml
name: Build and Deploy
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Install Rust
      uses: dtolnay/rust-toolchain@stable
    - name: Build Frontend
      run: |
        cd frontend
        npm install
        npm run tauri build
```

## 常见问题

### 1. Tauri 构建失败
- 确保 Rust 已正确安装
- 检查系统版本兼容性
- 清理缓存：`npm run tauri clean`

### 2. API 调用失败
- 检查 OpenAI API Key
- 确认网络连接
- 查看 API 服务器日志

### 3. 语音不工作
- 检查 edge-tts 语音包是否安装
- 验证音频文件权限
- 测试不同的语音音色

### 4. 记忆存储问题
- 确保 `memory/` 目录存在且可写
- 检查文件系统权限
- 定期清理旧的记忆文件

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request
5. 等待代码审查

## 维护任务

1. **依赖更新**
   ```bash
   # 更新 Python 依赖
   pip-compile requirements.in

   # 更新 Node.js 依赖
   cd frontend && npm update
   ```

2. **版本发布**
   - 更新版本号
   - 更新 CHANGELOG
   - 创建新分支
   - 提到远程仓库

3. **文档更新**
   - 更新 API 文档
   - 更新用户指南
   - 更新开发指南