// Lightweight STOMP / WebSocket client for TaskFlow real-time sync

export type TaskEventAction = 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'DELETED';

export interface TaskSocketEvent {
  action: TaskEventAction;
  task?: any;
  taskId?: string;
}

export class TaskFlowWebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<(event: TaskSocketEvent) => void>> = new Map();
  private isConnected = false;
  private reconnectTimer: any = null;

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    // Derive ws / wss protocol from http / https
    let wsBase = apiUrl.replace(/^http/, 'ws').replace(/\/api$/, '');
    if (!wsBase.includes('://')) {
      wsBase = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
    }
    this.url = `${wsBase}/ws-raw`;
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.isConnected = true;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.projectId) {
            const projectListeners = this.listeners.get(data.projectId);
            projectListeners?.forEach((cb) => cb(data));
          }
        } catch {
          // Ignore non-json frames (e.g. heartbeat)
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.isConnected = false;
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  public subscribe(projectId: string, callback: (event: TaskSocketEvent) => void): () => void {
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Set());
    }
    this.listeners.get(projectId)?.add(callback);
    this.connect();

    return () => {
      const set = this.listeners.get(projectId);
      set?.delete(callback);
      if (set?.size === 0) {
        this.listeners.delete(projectId);
      }
    };
  }

  public getStatus() {
    return this.isConnected;
  }
}

export const wsClient = new TaskFlowWebSocketClient();
