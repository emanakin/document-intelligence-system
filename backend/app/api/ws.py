from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from websocket.manager import manager

router = APIRouter()

@router.websocket("/ws/{doc_id}")
async def ws_progress(websocket: WebSocket, doc_id: str):
    await manager.connect(doc_id, websocket)
    try:
        while True:
            # keep connection alive; we don't expect messages *from* client
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(doc_id, websocket)