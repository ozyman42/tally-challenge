import { Message, Token } from "../state/state";

export interface StorageState {
    user: {
        address: string;
        signInSignature: string;
        signInMessage: string;
    };
    messages: Message[];
    tokens: Token[];
    // Cache this so we don't need to continuously refetch. Key is contract address.
    tokenMetadata: Record<string, Token['metadata']>;
}

export interface StorageAccessor {
    get: <K extends keyof StorageState> (k: K) => StorageState[K] | undefined;
    set: (kv: Partial<StorageState>) => void;
}

export const LocalStorage: StorageAccessor = {
    get: k => {
        const v = localStorage.getItem(k);
        if (v === null) return undefined;
        return JSON.parse(v);
    },
    set: kv => {
        for (const [k, v] of Object.entries(kv)) {
            if (v === undefined) localStorage.removeItem(k);
            else localStorage.setItem(k, JSON.stringify(v));
        }
    }
}