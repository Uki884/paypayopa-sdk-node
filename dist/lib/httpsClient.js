"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpsClient = void 0;
const https = __importStar(require("https"));
class HttpsClient {
    constructor() { }
    printDebugMessage(status, body, apiName) {
        try {
            const parseBody = JSON.parse(body);
            const code = parseBody.resultInfo.code;
            const codeId = parseBody.resultInfo.codeId;
            const RESOLVE_URL = `https://developer.paypay.ne.jp/develop/resolve?api_name=${apiName}&code=${code}&code_id=${codeId}`;
            console.log(`This link should help you to troubleshoot the error: ${RESOLVE_URL}`);
        }
        catch (e) {
            console.log(`The response to ${apiName} with status ${status} had an unexpected form`);
        }
    }
    httpsCall(options, payload, callback) {
        if (payload === undefined) {
            payload = "";
        }
        let body = "";
        let status;
        const apiName = options.apiKey;
        delete options.apiKey;
        const req = https.request(options, (res) => {
            status = res === null || res === void 0 ? void 0 : res.statusCode;
            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                body += Buffer.from(chunk);
            });
            res.on("end", () => {
                if (status < 200 || status > 299) {
                    this.printDebugMessage(status, body, apiName);
                }
                let parsed;
                try {
                    parsed = body.match(/\S/) ? JSON.parse(body) : null;
                }
                catch (e) {
                    callback({ STATUS: 500, ERROR: e.message });
                    return;
                }
                const responseObject = parsed && Object.assign(Object.create({ toString() { return body; } }), parsed);
                callback({ STATUS: status, BODY: responseObject });
            });
        });
        req.on("error", (e) => {
            callback({ STATUS: status, ERROR: e.message });
        });
        if (options.method === "POST") {
            req.write(JSON.stringify(payload));
        }
        req.end();
    }
}
exports.HttpsClient = HttpsClient;
