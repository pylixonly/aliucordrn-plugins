import { RPLogger } from "../utils/Logger";
import RPCClient from "./RPCClient";

export default class RPWebSocket extends WebSocket {
    rpcClient: RPCClient;

    constructor(url: string, rpcClient: RPCClient, protocols?: string | string[]) {
        super(url, protocols);
        this.rpcClient = rpcClient;
    }

    onopen: (event: Event) => void = (event) => {
        RPLogger.info(`[OPEN] Connected to websocket: ${this.url}`);   
        this.send("[READY] Websocket is ready to receive messages"); 
    }
    onmessage: (event: MessageEvent) => void = (event) => {
        RPLogger.info(`[MESSAGE] Data received from websocket: ${event.data}`);
        
        const response = JSON.parse(event.data);
        switch (response.type) {
            case "UPDATE": {
                this.rpcClient.sendRPC(response.activity);
                break;
            }
            case "STOP": {
                this.rpcClient.updateRPC(null);
                break;
            }
        }
    }
    onclose: (event: CloseEvent) => void = (event) => {
        if (event.wasClean) {
            RPLogger.info(`[CLOSE] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            RPLogger.warn(`[CLOSE] Connection died`);
        }

        // this.updateRPC(null);
    }
    onerror: (event: Event) => void = (event) => {
        RPLogger.error(`[ERROR] ${(event as ErrorEvent).message}`)
    }
}