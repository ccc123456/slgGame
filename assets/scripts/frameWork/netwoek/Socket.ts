import { packMsg } from "./data_pack";
import { ISocket, NetData } from "./NetInterface";

export class Socket implements ISocket {
	private _ws: WebSocket = null;              // websocket对象

	onConnected: (event) => void = null;
	onMessage: (msg) => void = null;
	onError: (event) => void = null;
	onClosed: (event) => void = null;

	connect(options: any) {
		if (this._ws) {
			if (this._ws.readyState === WebSocket.CONNECTING) {
				console.log("websocket connecting, wait for a moment...")
				return true; 
			}
		}

		let url = null;
		if (options.url) {
			url = options.url;
		} else {
			let ip = options.ip;
			let port = options.port;
			let protocol = options.protocol;
			url = `${protocol}://${ip}:${port}`;
		}

		this._ws = new WebSocket(url);
		this._ws.binaryType = options.binaryType ? options.binaryType : "arraybuffer";
		this._ws.onmessage = (event) => {
			this.onMessage(event.data);
		};
		this._ws.onopen = this.onConnected;
		this._ws.onerror = this.onError;
		this._ws.onclose = this.onClosed;
		return true;
	}

	send(buffer: NetData) {
		if (this._ws.readyState == WebSocket.OPEN) {
			this._ws.send(buffer);
			return true;
		}
		return false;
	}

	close(code: number = 1000, reason: string = "") {
		this._ws.close(code, reason);
	}

	removeHandler() {
		if (!this._ws) {
			return
		}
		this._ws.onmessage = () => { }
		this._ws.onopen = () => { }
		this._ws.onerror = () => { }
		this._ws.onclose = () => { }
	}

	// constructor() {
	// 	this.connectWebSocket("ws://localhost:8080");
	// }

	// connectWebSocket(url: string) {
	// 	this._ws = new WebSocket(url);

	// 	this._ws.onopen = () => {
	// 		console.log("WebSocket连接成功");
	// 	}

	// 	this._ws.onmessage = (event) => {
	// 		console.log("收到服务器消息: " + event.data);
	// 	}

	// 	this._ws.onerror = (error) => {
	// 		console.error("WebSocket发生错误: ", error);
	// 	}

	// 	this._ws.onclose = () => {
	// 		console.log("WebSocket连接关闭");
	// 	}
	// }

	// sendMessage(msgId: number, msg: any) {
	// 	if (this._ws && this._ws.readyState === WebSocket.OPEN) {
	// 		let message = packMsg(msgId, msg);
	// 		this._ws.send(message);
	// 		console.log("发送消息: " + message);
	// 	} else {
	// 		console.warn("WebSocket未连接，无法发送消息");
	// 	}
	// }

	// closeConnection() {
	// 	if (this._ws) {
	// 		this._ws.close();
	// 	}
	// }
}

