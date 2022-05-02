export interface Config {
    PORT_NUMBER?: number;
    API_PAYMENT: {};
    API_WALLET: {};
    API_DIRECT_DEBIT: {};
    API_APP_INVOKE: {};
    API_WEB_CASHIER: {};
    API_ACCOUNT_LINK: {};
    API_SUBSCRIPTION: {};
}
export declare class Conf {
    private readonly pathConfig;
    private readonly configLookup;
    constructor(productionMode: boolean | undefined, perfMode: boolean);
    getHttpsMethod(nameApi: string, nameMethod: string): string;
    getHttpsPath(nameApi: string, nameMethod: string): string;
    getApiKey(nameApi: string, nameMethod: string): string | undefined;
    getHostname(): any;
    getPortNumber(): any;
}
