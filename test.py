"""
简单测试脚本 - 验证各模块功能
"""
import asyncio
from memory_tools import MemoryTools


def test_memory_tools():
    """测试记忆工具"""
    print("=== 测试记忆工具 ===")

    tools = MemoryTools()

    # 测试写入记忆
    print("\n1. 测试写入记忆...")
    result = tools.write_memory("测试：这是一条测试记忆", memory_type="daily")
    print(f"写入结果: {'成功' if result else '失败'}")

    # 测试检索记忆
    print("\n2. 测试检索记忆...")
    results = tools.search_memory("测试", top_k=3)
    print(f"检索到 {len(results)} 条相关记忆")
    for i, result in enumerate(results, 1):
        print(f"  {i}. [{result['source']}] {result['content']}")

    print("\n记忆工具测试完成！")


async def test_tts():
    """测试 TTS 语音"""
    print("\n=== 测试 TTS 语音 ===")

    try:
        import edge_tts
        import pygame

        pygame.mixer.init()

        text = "你好，我是艾米，很高兴认识你！"
        voice = "zh-CN-XiaoxiaoNeural"

        print(f"生成语音: {text}")
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save("test_output.mp3")

        print("播放语音...")
        pygame.mixer.music.load("test_output.mp3")
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.wait(100)

        print("TTS 测试完成！")

    except Exception as e:
        print(f"TTS 测试失败: {e}")


def test_memory_files():
    """测试记忆文件读取"""
    print("\n=== 测试记忆文件读取 ===")

    import os

    files = ["MEMORY.md", "SOUL.md"]
    for filename in files:
        filepath = os.path.join("memory", filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                print(f"\n{filename} 内容预览:")
                print(content[:200] + "..." if len(content) > 200 else content)


async def main():
    """主测试函数"""
    print("开始测试对话系统...\n")

    test_memory_tools()
    test_memory_files()
    await test_tts()

    print("\n=== 所有测试完成 ===")


if __name__ == "__main__":
    asyncio.run(main())