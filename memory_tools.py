import os
from datetime import datetime
from typing import Optional
import json
import re
from openai import OpenAI


class MemoryTools:
    def __init__(self, memory_dir: str = "memory"):
        self.memory_dir = memory_dir
        self.memory_file = os.path.join(memory_dir, "MEMORY.md")
        self.daily_memory_file = os.path.join(
            memory_dir, f"{datetime.now().strftime('%Y-%m-%d')}.md"
        )
        self.client = OpenAI()

    def write_memory(self, content: str, memory_type: str = "daily") -> bool:
        """写入记忆到文件（追加模式）"""
        try:
            timestamp = datetime.now().strftime("%H:%M:%S")

            if memory_type == "long":
                file_path = self.memory_file
                header = f"\n## {timestamp} - 长期记忆\n"
            else:
                file_path = self.daily_memory_file
                header = f"\n### {timestamp}\n"

            with open(file_path, "a", encoding="utf-8") as f:
                f.write(header + content + "\n")

            return True
        except Exception as e:
            print(f"写入记忆失败: {e}")
            return False

    def search_memory(self, query: str, top_k: int = 3) -> list:
        """检索记忆，混合使用关键词匹配和向量相似度"""
        results = []

        try:
            all_memories = self._read_all_memories()

            for memory in all_memories:
                score = self._calculate_relevance(query, memory["content"])
                if score > 0:
                    results.append(
                        {
                            "content": memory["content"],
                            "source": memory["source"],
                            "score": score,
                        }
                    )

            results.sort(key=lambda x: x["score"], reverse=True)
            return results[:top_k]

        except Exception as e:
            print(f"检索记忆失败: {e}")
            return []

    def _read_all_memories(self) -> list:
        """读取所有记忆文件"""
        memories = []

        if os.path.exists(self.memory_file):
            with open(self.memory_file, "r", encoding="utf-8") as f:
                content = f.read()
                for line in content.split("\n"):
                    if line.strip() and not line.startswith("#") and not line.startswith("-"):
                        memories.append(
                            {"content": line, "source": "long_term_memory"}
                        )

        if os.path.exists(self.daily_memory_file):
            with open(self.daily_memory_file, "r", encoding="utf-8") as f:
                content = f.read()
                for line in content.split("\n"):
                    if line.strip() and not line.startswith("#") and not line.startswith("-"):
                        memories.append(
                            {"content": line, "source": "daily_memory"}
                        )

        return memories

    def _calculate_relevance(self, query: str, content: str) -> float:
        """计算查询与内容的相似度（混合关键词和向量）"""
        query_lower = query.lower()
        content_lower = content.lower()

        # 关键词匹配分数
        keywords = query_lower.split()
        keyword_score = sum(
            1 for kw in keywords if kw in content_lower
        ) / len(keywords) if keywords else 0

        # 向量相似度（使用 OpenAI Embedding）
        try:
            query_embedding = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=query[:4000]
            ).data[0].embedding

            content_embedding = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=content[:4000]
            ).data[0].embedding

            cosine_similarity = sum(a * b for a, b in zip(query_embedding, content_embedding))
        except:
            cosine_similarity = 0

        # 混合评分（关键词 40%，向量 60%）
        return keyword_score * 0.4 + cosine_similarity * 0.6

    def get_context_for_agent(self) -> str:
        """为 Agent 准备上下文信息"""
        context = []

        # 读取长期记忆
        if os.path.exists(self.memory_file):
            with open(self.memory_file, "r", encoding="utf-8") as f:
                context.append(f"长期记忆:\n{f.read()}")

        # 读取当日记忆
        if os.path.exists(self.daily_memory_file):
            with open(self.daily_memory_file, "r", encoding="utf-8") as f:
                context.append(f"今日记忆:\n{f.read()}")

        return "\n\n".join(context)


def write_memory(content: str, memory_type: str = "daily") -> str:
    """Agent 可调用的写入记忆工具"""
    tools = MemoryTools()
    success = tools.write_memory(content, memory_type)
    return f"记忆写入{'成功' if success else '失败'}"


def search_memory(query: str, top_k: int = 3) -> str:
    """Agent 可调用的检索记忆工具"""
    tools = MemoryTools()
    results = tools.search_memory(query, top_k)

    if not results:
        return "未找到相关记忆"

    output = "检索到的记忆:\n"
    for i, result in enumerate(results, 1):
        output += f"{i}. [{result['source']}] {result['content']}\n"

    return output