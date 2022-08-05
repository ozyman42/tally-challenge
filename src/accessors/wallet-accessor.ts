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

const SIGN_IN_STATEMENT = 'Sign in with Ethereum';

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
            const result: string[] = await w.ethereum.send("eth_requestAccounts");
            if (!timedOut) {
                accountChosen = true;
                // TODO: handle user rejection
                if (result.length === 0) {
                    resolve({connected: false, error: ConnectError.NoAccounts});
                } else {
                    const address = result[0];
                    const signer = new ethers.providers.Web3Provider(w.ethereum).getSigner();
                    const signIn = new SiweMessage({
                        domain: window.location.host,
                        address,
                        statement: SIGN_IN_STATEMENT,
                        uri: window.location.origin,
                        version: '1', chainId: 1
                    });
                    let signature: undefined | string = undefined;
                    try {
                        const message = signIn.prepareMessage();
                        signature = await signer.signMessage(message);
                        resolve({connected: true, address, signInMessage: message, signInSignature: signature});
                    } catch(e) {
                        const error = e as {code: number};
                        if (error.code === 4001) {
                            resolve({
                                connected: false, error: ConnectError.UserRejectedConnectRequest
                            });
                            return;
                        }
                    }
                }
            }
        });
    },
    sign: async (message, address) => {
        const signer = new ethers.providers.Web3Provider(w.ethereum).getSigner();
        const signerAddress = await signer.getAddress();
        if (signerAddress !== address)
            return {signed: false, error: SignError.AddressMismatch};
        const signature = await signer.signMessage(message);
        return {signed: true, signature};
    },
    isSignatureValid: (message, address, signature) => {
        return address.toUpperCase() === ethers.utils.verifyMessage(message, signature).toUpperCase();
    }
}