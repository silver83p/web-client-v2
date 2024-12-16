declare module '@shardus/crypto-web' {
    export function initialize(key: string): void;
    export function generateKeys(): { publicKey: string; privateKey: string };
    export function hash(data: string): string;
    export function hashObj(obj: object): string;
    export function signObj(tx: unknown, privateKey: string, publicKey: string): void;
    export function safeStringify(obj: unknown, replacer?: (key: string, value: unknown) => unknown, space?: string | number): string;
    export function safeJsonParse(json: string): unknown;
    // Add other exports here as necessary
}
