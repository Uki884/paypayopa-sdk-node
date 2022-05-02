/// <reference types="node" />
import * as https from "https";
export interface HttpsClientSuccess {
    STATUS: number;
    BODY: object | null;
}
export interface HttpsClientError {
    STATUS: number;
    ERROR: string;
}
export interface HttpsClientMessage {
    (message: HttpsClientSuccess | HttpsClientError): void;
}
export declare class HttpsClient {
    constructor();
    printDebugMessage(status: number, body: string, apiName: string | undefined): void;
    httpsCall(options: https.RequestOptions & {
        apiKey?: string;
    }, payload: any, callback: HttpsClientMessage): void;
}
