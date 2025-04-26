from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self) -> None:
        self._rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room: str, ws: WebSocket) -> None:
        await ws.accept()
        self._rooms.setdefault(room, []).append(ws)

    def disconnect(self, room: str, ws: WebSocket) -> None:
        self._rooms.get(room, []).remove(ws)

    async def broadcast(self, room: str, message: dict) -> None:
        for ws in list(self._rooms.get(room, [])):
            try:
                await ws.send_json(message)
            except Exception:
                # client closed
                self.disconnect(room, ws)

manager = ConnectionManager() 