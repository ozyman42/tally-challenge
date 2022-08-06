import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

const w = window as unknown as {ethereum: any};

export enum ConnectError {
    UserRejectedConnectRequest = 'UserRejectedConnectRequest',
    NoWalletProviderDetected = 'NoWalletProviderDetected',
    WrongWallet = 'WrongWallet',
    TimedOutWaitingForAccount = 'TimedOutWaitingForAccount',
    NoAccounts = 'NoAccounts'
}

export type ConnectResult = 
    {connected: true; address: string; signInMessage: string; signInSignature: string} |
    {connected: false; error: ConnectError;};

export enum SignError {
    UserRejectedSignRequest = 'UserRejectedSignRequest',
    AddressMismatch = 'AddressMismatch'
}

export type SignResult =
    {signed: true; signature: string;} |
    {signed: false; error: SignError};

export interface WalletAccessor {
    connect: () => Promise<ConnectResult>;
    sign: (message: string, address: string) => Promise<SignResult>;
    isSignatureValid: (message: string, address: string, signature: string) => boolean;
}

async function sign(signer: ethers.providers.JsonRpcSigner, message: string): Promise<{rejected: true} | {rejected: false; signature: string;}> {
    try {
        const signature = await signer.signMessage(message);
        // TODO: there seems to be an issue where the Tally-signed message doesn't pass verification, but Metamask does when using the same code.
        console.log(await signer.getAddress());
        console.log(ethers.utils.verifyMessage(message, signature));
        return {rejected: false, signature};
    } catch (e) {
        const error = e as {code: number;};
        if (error.code === 4001) {
            return {rejected: true};
        }
        throw e;
    }
}

export const TallyWallet: WalletAccessor = {
    connect: async () => {
        // TODO: use Onboard.js mentioned here
        // https://docs.tally.cash/tally/developers/integrating-dapps
        if (w.ethereum === undefined) {
            return {connected: false, error: ConnectError.NoWalletProviderDetected};
        }
        if (!w.ethereum.isTally) {
            return {connected: false, error: ConnectError.WrongWallet};
        }
        return new Promise(async resolve => {
            let timedOut = false;
            let accountChosen = false;
            setTimeout(() => {
                timedOut = true;
                if (!accountChosen) {
                    resolve({
                        connected: false,
                        error: ConnectError.TimedOutWaitingForAccount
                    });
                }
            }, 10000);
            const accounts: string[] = await w.ethereum.send("eth_requestAccounts");
            if (!timedOut) {
                accountChosen = true;
                if (accounts.length === 0) {
                    resolve({connected: false, error: ConnectError.NoAccounts});
                } else {
                    const address = accounts[0];
                    const signer = new ethers.providers.Web3Provider(w.ethereum).getSigner();
                    const signIn = new SiweMessage({
                        domain: window.location.host,
                        address: address.toLowerCase(),
                        statement: 'Sign in with Ethereum',
                        uri: window.location.origin,
                        version: '1', chainId: 1
                    });
                    const message = signIn.prepareMessage();
                    const result = await sign(signer, message);
                    if (result.rejected) {
                        resolve({connected: false, error: ConnectError.UserRejectedConnectRequest});
                    } else {
                        resolve({connected: true, address, signInMessage: message, signInSignature: result.signature});
                    }
                }
            }
        });
    },
    sign: async (message, address) => {
        const signer = new ethers.providers.Web3Provider(w.ethereum).getSigner();
        const signerAddress = await signer.getAddress();
        if (signerAddress.toUpperCase() !== address.toUpperCase())
            return {signed: false, error: SignError.AddressMismatch};
        const result = await sign(signer, message);
        if (result.rejected) return {signed: false, error: SignError.UserRejectedSignRequest};
        else return {signed: true, signature: result.signature};
    },
    isSignatureValid: (message, address, signature) => {
        return address.toUpperCase() === ethers.utils.verifyMessage(message, signature).toUpperCase();
    }
}