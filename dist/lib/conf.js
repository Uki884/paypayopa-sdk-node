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
exports.Conf = void 0;
const pathConfig = __importStar(require("./conf.path.json"));
const constants_1 = require("./constants");
class Conf {
    constructor(productionMode = false, perfMode) {
        this.pathConfig = pathConfig;
        this.configLookup = JSON.parse(JSON.stringify(this.pathConfig));
        if (productionMode) {
            this.configLookup.HOST_NAME = constants_1.HOST_PATH.PROD;
        }
        else {
            this.configLookup.HOST_NAME = constants_1.HOST_PATH.STAGING;
        }
        if (perfMode) {
            this.configLookup.HOST_NAME = constants_1.HOST_PATH.PERF_MODE;
        }
    }
    getHttpsMethod(nameApi, nameMethod) {
        return this.configLookup[nameApi][nameMethod].METHOD;
    }
    getHttpsPath(nameApi, nameMethod) {
        return this.configLookup[nameApi][nameMethod].PATH;
    }
    getApiKey(nameApi, nameMethod) {
        return this.configLookup[nameApi][nameMethod].API_NAME;
    }
    getHostname() {
        return this.configLookup.HOST_NAME;
    }
    getPortNumber() {
        return this.configLookup.PORT_NUMBER ? this.configLookup.PORT_NUMBER : 443;
    }
}
exports.Conf = Conf;
