"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
class Auth {
    constructor() {
        this.clientId = "";
        this.clientSecret = "";
        this.merchantId = "";
    }
    setAuth(clientId, clientSecret, merchantId) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.merchantId = merchantId;
    }
}
exports.Auth = Auth;
