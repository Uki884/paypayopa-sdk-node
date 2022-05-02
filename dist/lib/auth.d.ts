export declare class Auth {
    clientId: string;
    clientSecret: string;
    merchantId?: string;
    constructor();
    setAuth(clientId: string, clientSecret: string, merchantId?: string): void;
}
