import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "@/lib/config";
import authService from "@/services/auth";

interface UpdateMsg {
  percent: number;
  message: string;
}

export default function useAnalysisProgress(
  docId?: string,
  isProcessing = true
) {
  const [update, setUpdate] = useState<UpdateMsg>({
    percent: 0,
    message: "Initializing...",
  });

  // Track connection state for UI feedback
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isProcessing || !docId) return;

    /* open connection after brief delay */
    const timer = setTimeout(() => {
      const wsBase = API_BASE_URL.replace(/^http(s)?:\/\//, "ws$1://").replace(
        /\/$/,
        ""
      );
      const token = authService.getToken();
      const url = `${wsBase}/ws/${docId}${token ? `?token=${token}` : ""}`;

      try {
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
          setConnected(true);
          setError("");
        };

        wsRef.current.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data) as UpdateMsg;
            setUpdate(data);

            if (data.percent === 100 && wsRef.current) {
              wsRef.current.close(1000, "done");
            }
          } catch {
            /* ignore malformed messages */
          }
        };

        wsRef.current.onerror = () => setError("WebSocket error");

        wsRef.current.onclose = () => {
          setConnected(false);
          wsRef.current = null;
        };
      } catch {
        setError("Failed to connect");
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      wsRef.current?.close();
    };
  }, [docId, isProcessing]);

  return { ...update, connected, error };
}
