const MAGIC_ID = 0x20a72aa9;

export interface UnpackedMsg {
    msgId: number;
    result: number;
    payload: any;
}

//处理一个消息打包类，负责将消息打包成二进制数据，发送给服务器
export function packMsg(msgId: number, msg: any): ArrayBuffer {
    // let payload: Uint8Array = encodeCsPlayerLogin(msg);

    const buffer = new ArrayBuffer(12 + msg.byteLength);
    const view = new DataView(buffer);
    view.setUint32(0, MAGIC_ID, false);
    view.setUint32(4, msgId >>> 0, false);
    view.setUint32(8, msg.byteLength >>> 0, false);

    new Uint8Array(buffer, 12).set(msg);
    return buffer;
}

//解包函数，负责将服务器发送的二进制数据解包成消息对象
export function unpackMsg(buffer: ArrayBuffer): UnpackedMsg {
    const MIN_HEADER_LEN = 16;
    if (buffer.byteLength < MIN_HEADER_LEN) {
        throw new Error('Buffer too small to contain message header');
    }

    const view = new DataView(buffer);
    const magic = view.getUint32(0, false);
    if (magic !== MAGIC_ID) {
        throw new Error(`Invalid magic id: 0x${magic.toString(16)}`);
    }

    const msgId = view.getUint32(4, false);
    const result = view.getUint32(8, false);
    const msgLength = view.getUint32(12, false);
    // const totalLength = MIN_HEADER_LEN + msgLength;
    const payload = new Uint8Array(buffer, 16)
    return {
        msgId,
        result,
        payload,
    };

}
