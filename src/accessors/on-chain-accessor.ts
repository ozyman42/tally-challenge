import { Token } from "../state/state";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { BigNumber } from 'ethers';

export interface TokenMetadataCache {
    get: (contractAddress: string) => Token['metadata'] | undefined;
    set: (contractAddress: string, metadata: Token['metadata']) => void;
}

export interface RPCAccessor {
    loadTokens: (address: string, tokenMetadataCache: TokenMetadataCache) => Promise<Token[]>;
}

const ALCHEMY_API_KEY = "_ArbR3W9Ttz3Cx1Ofa_vVhcIxzxbx7tC"
const ALCHEMY_ENDPOINT = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const { alchemy, eth } = createAlchemyWeb3(ALCHEMY_ENDPOINT);
// TODO: support base assets of other networks
const ETHEREUM_METADATA: Token['metadata'] = {
    symbol: "ETH",
    iconURI: "https://arweave.net/5bHG1Zkum6BvvhhACZbT3Py2YG-ir0xyTgFFpx2tcL4",
    name: "Ethereum",
    address: "N/A (base network asset)",
    decimals: 18
}

export const Alchemy: RPCAccessor = {
    loadTokens: async (address, cache) => {
        const ethBalance = await eth.getBalance(address);
        const ethToken: Token = {
            amount: BigNumber.from(ethBalance),
            metadata: ETHEREUM_METADATA
        };
        const balances = await alchemy.getTokenBalances(address);
        const tokens: Token[] = await Promise.all(balances.tokenBalances
            .filter(balance => !BigNumber.from(balance.tokenBalance).isZero())
            .map(async ({tokenBalance, contractAddress}) => {
                let metadata = cache.get(contractAddress);
                if (metadata === undefined) {
                    const { logo, name, symbol, decimals } = await alchemy.getTokenMetadata(contractAddress);
                    metadata = {
                        symbol: symbol!,
                        iconURI: logo!,
                        name: name!,
                        address: contractAddress,
                        decimals: decimals!
                    };
                    cache.set(contractAddress, metadata);
                }
                return {
                    metadata,
                    amount: BigNumber.from(tokenBalance)
                }
            }));
        if (!ethToken.amount.isZero())
            return [ethToken, ...tokens];
        else
            return tokens;
    }
}