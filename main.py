import asyncio
import os
from typing import Annotated, Literal, TypedDict
from langgraph.graph import END, StateGraph, START
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
import edge_tts
import pygame
from dotenv import load_dotenv

from memory_tools import MemoryTools, write_memory, search_memory

load_dotenv()

os.makedirs("audio_cache", exist_ok=True)

class State(TypedDict):
    messages: Annotated[list, add_messages]
    context: str


class ConversationAgent:
    def __init__(self):
        self.memory_tools = MemoryTools()
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

        # 读取角色人格
        soul_path = os.path.join("memory", "SOUL.md")
        with open(soul_path, "r", encoding="utf-8") as f:
            self.soul_content = f.read()

        # 构建系统消息
        self.system_message = f"""{self.soul_content}

你是一个具备长期记忆和情感理解的 AI 助手。
你有以下工具可用：
1. write_memory: 将重要信息写入记忆（每日记忆或长期记忆）
2. search_memory: 从记忆中检索相关信息

记住：
- 主动记录用户的重要信息、偏好和事件
- 当需要查询过往信息时使用 search_memory
- 保持真诚、温暖且个性化的交流风格
- 对话中适当自然地运用你的记忆
"""

        self.graph = self._build_graph()
        self.memory_saver = MemorySaver()

        # 初始化音频播放器
        pygame.mixer.init()

    def _build_graph(self):
        """构建 LangGraph"""
        workflow = StateGraph(State)

        workflow.add_node("prepare_context", self._prepare_context)
        workflow.add_node("agent", self._agent_node)
        workflow.add_node("update_memory", self._update_memory)
        workflow.add_node("tts_output", self._tts_output)

        workflow.add_edge(START, "prepare_context")
        workflow.add_edge("prepare_context", "agent")
        workflow.add_edge("agent", "update_memory")
        workflow.add_edge("update_memory", "tts_output")
        workflow.add_edge("tts_output", END)

        return workflow.compile(checkpointer=self.memory_saver)

    def _prepare_context(self, state: State):
        """准备上下文"""
        context = self.memory_tools.get_context_for_agent()
        last_messages = state["messages"][-3:] if len(state["messages"]) >= 3 else state["messages"]

        # 从对话中提取关键词进行相关记忆检索
        if last_messages:
            query = " ".join([msg.content for msg in last_messages])
            relevant_memories = self.memory_tools.search_memory(query, top_k=2)
            if relevant_memories:
                memory_context = "\n相关记忆:\n"
                for memory in relevant_memories:
                    memory_context += f"- {memory['content']}\n"
                context += "\n" + memory_context

        return {"context": context}

    def _agent_node(self, state: State):
        """Agent 节点"""
        messages = [
            SystemMessage(content=self.system_message),
            *state["messages"]
        ]

        response = self.llm.invoke(messages)
        return {"messages": [response]}

    def _update_memory(self, state: State):
        """更新记忆"""
        last_message = state["messages"][-1]

        # 智能判断是否需要写入记忆
        if "重要" in last_message.content or "记住" in last_message.content:
            self.memory_tools.write_memory(
                f"对话片段: {last_message.content}",
                memory_type="daily"
            )

        return {}

    async def _tts_output(self, state: State):
        """TTS 语音输出"""
        last_message = state["messages"][-1]
        text = last_message.content

        voice = os.getenv("EDGE_TTS_VOICE", "zh-CN-XiaoxiaoNeural")
        rate = os.getenv("EDGE_TTS_RATE", "+0%")

        communicate = edge_tts.Communicate(text, voice, rate=rate)

        output_file = "output.mp3"
        await communicate.save(output_file)

        # 播放音频
        if os.path.exists(output_file):
            pygame.mixer.music.load(output_file)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                pygame.time.wait(100)

        return {}

    def chat(self, user_input: str, session_id: str = "default"):
        """处理用户输入"""
        config = {"configurable": {"thread_id": session_id}}

        # 创建初始状态
        result = self.graph.invoke(
            {"messages": [HumanMessage(content=user_input)], "context": ""},
            config=config
        )

        return result["messages"][-1].content

    async def chat_with_voice(self, user_input: str, session_id: str = "default"):
        """处理用户输入并播放语音"""
        response = self.chat(user_input, session_id)
        print(f"助手: {response}")
        return response


async def main():
    """主函数"""
    agent = ConversationAgent()

    print("=== 对话系统启动 ===")
    print("输入 'quit' 或 'exit' 退出\n")

    session_id = "main_session"

    while True:
        try:
            user_input = input("用户: ").strip()

            if user_input.lower() in ["quit", "exit", "退出"]:
                print("再见！👋")
                break

            if not user_input:
                continue

            await agent.chat_with_voice(user_input, session_id)

        except KeyboardInterrupt:
            print("\n再见！👋")
            break
        except Exception as e:
            print(f"发生错误: {e}")


if __name__ == "__main__":
    asyncio.run(main())