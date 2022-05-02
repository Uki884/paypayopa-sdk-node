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
exports.PayPayRestSDK = exports.payPayRestSDK = void 0;
const auth_1 = require("./auth");
const conf_1 = require("./conf");
const httpsClient_1 = require("./httpsClient");
const crypto_js_1 = require("crypto-js");
const uuid_1 = require("uuid");
const jwt = __importStar(require("jsonwebtoken"));
const https_proxy_agent_1 = require("https-proxy-agent");
class PayPayRestSDK {
    constructor() {
        this.productionMode = false;
        this.perfMode = false;
        this.proxyUrl = '';
        this.httpsClient = new httpsClient_1.HttpsClient();
        this.configure = (clientConfig) => {
            this.auth.setAuth(clientConfig.clientId, clientConfig.clientSecret, clientConfig.merchantId);
            if (clientConfig.productionMode) {
                this.productionMode = clientConfig.productionMode;
            }
            else {
                this.productionMode = false;
            }
            if (clientConfig.perfMode) {
                this.perfMode = clientConfig.perfMode;
            }
            if (clientConfig.proxyUrl) {
                this.proxyUrl = clientConfig.proxyUrl;
            }
            this.config = new conf_1.Conf(this.productionMode, this.perfMode);
        };
        this.createAuthHeader = (method, resourceUrl, body) => {
            const epoch = Math.floor(Date.now() / 1000);
            const nonce = (0, uuid_1.v4)();
            const jsonified = JSON.stringify(body);
            const isempty = [undefined, null, "", "undefined", "null"];
            let contentType;
            let payloadDigest;
            if (isempty.includes(jsonified)) {
                contentType = "empty";
                payloadDigest = "empty";
            }
            else {
                contentType = "application/json";
                payloadDigest = crypto_js_1.algo.MD5.create()
                    .update(contentType)
                    .update(jsonified)
                    .finalize()
                    .toString(crypto_js_1.enc.Base64);
            }
            const signatureRawList = [
                resourceUrl,
                method,
                nonce,
                epoch,
                contentType,
                payloadDigest,
            ];
            const signatureRawData = signatureRawList.join("\n");
            const hashed = (0, crypto_js_1.HmacSHA256)(signatureRawData, this.auth.clientSecret);
            const hashed64 = crypto_js_1.enc.Base64.stringify(hashed);
            const headList = [
                this.auth.clientId,
                hashed64,
                nonce,
                epoch,
                payloadDigest,
            ];
            const header = headList.join(":");
            return `hmac OPA-Auth:${header}`;
        };
        this.paypaySetupOptions = (endpoint, input) => {
            let agent;
            if (this.proxyUrl) {
                agent = new https_proxy_agent_1.HttpsProxyAgent(this.proxyUrl);
            }
            const method = endpoint.method;
            const path = method === "GET" || method === "DELETE"
                ? this.fillPathTemplate(endpoint.path, input)
                : endpoint.path;
            const headers = {};
            const isempty = ["undefined", "null"];
            if (this.auth.merchantId && !isempty.includes(this.auth.merchantId)) {
                headers["X-ASSUME-MERCHANT"] = this.auth.merchantId;
            }
            if (method === "POST") {
                input.requestedAt = Math.round(new Date().getTime() / 1000);
                headers["Content-Type"] = "application/json";
                headers["Content-Length"] = Buffer.byteLength(JSON.stringify(input));
            }
            const cleanPath = path.split("?")[0];
            const authHeader = this.createAuthHeader(method, cleanPath, method === "GET" || method === "DELETE" ? null : input);
            headers["Authorization"] = authHeader;
            return {
                apiKey: endpoint.apiKey,
                hostname: this.config.getHostname(),
                port: this.config.getPortNumber(),
                headers,
                path,
                method,
                agent,
            };
        };
        this.getEndpoint = (nameApi, nameMethod, pathSuffix = "") => {
            return {
                method: this.config.getHttpsMethod(nameApi, nameMethod),
                path: this.config.getHttpsPath(nameApi, nameMethod) + pathSuffix,
                apiKey: this.config.getApiKey(nameApi, nameMethod),
            };
        };
        this.invokeMethod = (endpoint, payload, callback) => {
            const options = this.paypaySetupOptions(endpoint, payload);
            return new Promise((resolve) => {
                this.httpsClient.httpsCall(options, payload, (result) => {
                    resolve(result);
                    if (callback !== undefined) {
                        callback(result);
                    }
                });
            });
        };
        this.createPayment = (payload, ...args) => {
            const agreeSimilarTransaction = args[0] === true;
            const callback = typeof args[0] === "boolean" ? args[1] : args[0];
            const endpoint = this.getEndpoint("API_PAYMENT", "CREATE_PAYMENT", `?agreeSimilarTransaction=${agreeSimilarTransaction}`);
            return this.invokeMethod(endpoint, payload, callback);
        };
        this.qrCodeCreate = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "QRCODE_CREATE"), payload, callback);
        };
        this.qrCodeDelete = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "QRCODE_DELETE"), inputParams, callback);
        };
        this.getCodePaymentDetails = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "GET_CODE_PAYMENT_DETAILS"), inputParams, callback);
        };
        this.getPaymentDetails = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "GET_PAYMENT_DETAILS"), inputParams, callback);
        };
        this.paymentCancel = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "CANCEL_PAYMENT"), inputParams, callback);
        };
        this.paymentAuthCapture = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "PAYMENT_AUTH_CAPTURE"), payload, callback);
        };
        this.paymentAuthRevert = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "PAYMENT_AUTH_REVERT"), payload, callback);
        };
        this.paymentRefund = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "REFUND_PAYMENT"), payload, callback);
        };
        this.getRefundDetails = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "GET_REFUND_DETAILS"), inputParams, callback);
        };
        this.checkUserWalletBalance = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_WALLET", "CHECK_BALANCE"), inputParams, callback);
        };
        this.authorization = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_DIRECT_DEBIT", "AUTHORIZATION"), inputParams, callback);
        };
        this.authorizationResult = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_DIRECT_DEBIT", "AUTHORIZATION_RESULT"), inputParams, callback);
        };
        this.accountLinkQRCodeCreate = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_ACCOUNT_LINK", "QRCODE_CREATE"), payload, callback);
        };
        this.validateJWT = (token, clientSecret) => {
            return jwt.verify(token, Buffer.from(clientSecret, "base64"));
        };
        this.paymentPreauthorize = (payload, ...args) => {
            const agreeSimilarTransaction = args[0] === true;
            const callback = typeof args[0] === "boolean" ? args[1] : args[0];
            const endpoint = this.getEndpoint("API_PAYMENT", "PREAUTHORIZE", `?agreeSimilarTransaction=${agreeSimilarTransaction}`);
            return this.invokeMethod(endpoint, payload, callback);
        };
        this.paymentSubscription = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_SUBSCRIPTION", "PAYMENTS"), payload, callback);
        };
        this.createPendingPayment = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_REQUEST_ORDER", "PENDING_PAYMENT_CREATE"), payload, callback);
        };
        this.getPendingPaymentDetails = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_REQUEST_ORDER", "GET_ORDER_DETAILS"), inputParams, callback);
        };
        this.cancelPendingOrder = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_REQUEST_ORDER", "PENDING_ORDER_CANCEL"), inputParams, callback);
        };
        this.refundPendingPayment = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "REFUND_PAYMENT"), payload, callback);
        };
        this.getUserAuthorizationStatus = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("USER_AUTHORIZATION", "GET_USER_AUTHORIZATION_STATUS"), inputParams, callback);
        };
        this.unlinkUser = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("USER_AUTHORIZATION", "UNLINK_USER"), inputParams, callback);
        };
        this.cashBack = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "GIVE_CASH_BACK"), payload, callback);
        };
        this.getCashBackDetails = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "CHECK_CASHBACK_DETAILS"), inputParams, callback);
        };
        this.reverseCashBack = (payload, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "REVERSAL_CASHBACK"), payload, callback);
        };
        this.getReverseCashBackDetails = (inputParams, callback) => {
            return this.invokeMethod(this.getEndpoint("API_PAYMENT", "CHECK_CASHBACK_REVERSE_DETAILS"), inputParams, callback);
        };
        this.config = new conf_1.Conf(this.productionMode, this.perfMode);
        this.auth = new auth_1.Auth();
    }
    setHttpsClient(httpsClient) {
        this.httpsClient = httpsClient;
    }
    fillPathTemplate(template, input) {
        const queryParams = template.match(/{\w+}/g);
        if (queryParams) {
            queryParams.forEach((q, n) => {
                template = template.replace(q, input[n]);
            });
        }
        return template;
    }
}
exports.PayPayRestSDK = PayPayRestSDK;
exports.payPayRestSDK = new PayPayRestSDK();
