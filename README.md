# 智能对话系统

基于 LangGraph + edge-tts + OpenAI 构建的具备跨会话记忆、角色扮演和中文语音输出的对话系统。

## 功能特点

- **长期记忆系统**: 记录用户偏好、重要事件、知识积累
- **每日记忆**: 自动记录当日对话内容
- **角色扮演**: 拥有完整的人格设定（艾米 - 温暖友好、乐于助人的 AI 助手）
- **智能检索**: 混合关键词匹配和向量相似度的记忆检索
- **语音输出**: 使用 edge-tts 实现中文语音合成
- **跨会话保持**: 基于 LangGraph 的 MemorySaver 保持对话连续性

## 技术栈

- **LangGraph**: 对话流程管理
- **OpenAI GPT-4**: 语言模型和向量嵌入
- **edge-tts**: 微软 Edge TTS 语音合成
- **pygame**: 音频播放
- **python-dotenv**: 环境变量管理

## 快速开始

### 1. 环境配置

```bash
# 安装依赖
pip install -r requirements.txt

# 配置 API Key
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key
```

### 2. 运行系统

```bash
python main.py
```

### 3. 使用说明

- 直接输入文字进行对话
- 系统会自动将重要信息写入记忆
- 支持中英文混合对话
- 语音会自动播放

### 4. 自定义设置

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
├── main.py              # 主程序
├── memory_tools.py      # 记忆工具
├── memory/             # 记忆目录
│   ├── MEMORY.md       # 长期记忆
│   ├── SOUL.md         # 角色人格
│   └── 2026-04-27.md   # 每日记忆
├── .env                # 环境变量
├── .env.example        # 环境变量模板
└── requirements.txt    # 依赖列表
```

## 高级用法

### 自定义记忆策略

修改 `memory_tools.py` 中的 `write_memory` 函数来自定义何时写入记忆。

### 扩展工具

在 `main.py` 的 `_agent_node` 中添加新的工具函数。

### 语音输出定制

修改 `main.py` 中的 `_tts_output` 函数来自定义语音输出逻辑。

## 注意事项

1. 需要有效的 OpenAI API Key
2. 首次运行可能需要下载语音模型
3. 音频播放需要扬声器支持
4. 记忆文件会持续增长，建议定期清理

## 许可证

仅供学习使用。