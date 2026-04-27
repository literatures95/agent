from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, AsyncGenerator
import asyncio
import os
from datetime import datetime
import json

from main import ConversationAgent
from langchain_core.messages import HumanMessage

app = FastAPI(title="艾米对话系统 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = ConversationAgent()

sessions_file = "sessions.json"

def load_sessions():
    if os.path.exists(sessions_file):
        with open(sessions_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"default": {"name": "默认会话", "created_at": datetime.now().isoformat()}}

def save_sessions(sessions):
    with open(sessions_file, "w", encoding="utf-8") as f:
        json.dump(sessions, f, ensure_ascii=False, indent=2)


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    with_voice: bool = False


class SessionRequest(BaseModel):
    session_id: str
    name: str


@app.get("/")
async def root():
    return {"message": "艾米对话系统 API", "version": "1.0.0"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = agent.chat(request.message, request.session_id)
        return {
            "response": response,
            "session_id": request.session_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/voice")
async def chat_with_voice(request: ChatRequest):
    try:
        response = agent.chat(request.message, request.session_id)

        voice = os.getenv("EDGE_TTS_VOICE", "zh-CN-XiaoxiaoNeural")
        rate = os.getenv("EDGE_TTS_RATE", "+0%")

        import edge_tts
        communicate = edge_tts.Communicate(response, voice, rate=rate)

        audio_file = f"audio_{request.session_id}_{datetime.now().timestamp()}.mp3"
        audio_path = os.path.join("audio_cache", audio_file)

        os.makedirs("audio_cache", exist_ok=True)
        await communicate.save(audio_path)

        return {
            "response": response,
            "audio_file": audio_file,
            "session_id": request.session_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    async def generate_response() -> AsyncGenerator[str, None]:
        try:
            # 构建消息
            messages = [HumanMessage(content=request.message)]

            # 使用流式调用
            async for chunk in agent.llm.astream(messages):
                if chunk.content:
                    data = json.dumps({"content": chunk.content})
                    yield f"data: {data}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            error_data = json.dumps({"error": str(e)})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@app.get("/api/audio/{filename}")
async def get_audio(filename: str):
    audio_path = os.path.join("audio_cache", filename)
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="音频文件不存在")
    return FileResponse(audio_path, media_type="audio/mpeg")


@app.get("/api/memory/long")
async def get_long_memory():
    try:
        memory_file = os.path.join("memory", "MEMORY.md")
        if os.path.exists(memory_file):
            with open(memory_file, "r", encoding="utf-8") as f:
                content = f.read()
            return {"content": content}
        return {"content": ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/memory/daily")
async def get_daily_memory():
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        memory_file = os.path.join("memory", f"{today}.md")
        if os.path.exists(memory_file):
            with open(memory_file, "r", encoding="utf-8") as f:
                content = f.read()
            return {"content": content, "date": today}
        return {"content": "", "date": today}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sessions")
async def get_sessions():
    try:
        sessions = load_sessions()
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/sessions")
async def create_session(request: SessionRequest):
    try:
        sessions = load_sessions()
        if request.session_id in sessions:
            sessions[request.session_id]["name"] = request.name
        else:
            sessions[request.session_id] = {
                "name": request.name,
                "created_at": datetime.now().isoformat()
            }
        save_sessions(sessions)
        return {"message": "会话已保存", "session_id": request.session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    try:
        sessions = load_sessions()
        if session_id in sessions and session_id != "default":
            del sessions[session_id]
            save_sessions(sessions)
            return {"message": "会话已删除"}
        raise HTTPException(status_code=400, detail="无法删除默认会话")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)