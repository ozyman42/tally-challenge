import { Token } from "../state/state"

export interface RPCAccessor {
    loadTokens: (address: string) => Promise<Token[]>;
}

const ALCHEMY_API_KEY = "_ArbR3W9Ttz3Cx1Ofa_vVhcIxzxbx7tC"
const ALCHEMY_ENDPOINT = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
export const Alchemy: RPCAccessor = {
    loadTokens: async address => {
        return [];
    }
}