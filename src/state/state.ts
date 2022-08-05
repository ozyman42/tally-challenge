import create from 'zustand';
import { Alchemy, RPCAccessor } from '../accessors/on-chain-accessor';
import { LocalStorage, StorageAccessor } from '../accessors/storage-accessor';
import { ConnectError, SignError, TallyWallet, WalletAccessor } from '../accessors/wallet-accessor';

export type Message = {
    author: string;
    message: string;
    signature: string;
    time: number;
}

export type Token = {
    metadata: {
        iconURI: string;
        symbol: string;
        address: string;
        name: string;
    }
    amount: number;
}

export enum SignInError {
    NoAccounts = 'NoAccounts',
    TallyNotChosen = 'TallyNotChosen',
    UserDeclinedConnectRequest = 'UserDeclinedConnectRequest',
    NoWalletDetected = 'NoWalletDetected',
    TimedOutWhileWaitingForAccounts = 'TimedOutWhileWaitingForAccounts'
}

export type SignInResult = 
    {success: true; address: string;} |
    {success: false; error: SignInError};

export enum SignAndSendError {
    UserDeclinedSignRequest = 'UserDeclinedSignRequest',
    AddressMismatch = 'AddressMismatch',
    NotSignedIn =  'NotSignedIn'
}

export type SignAndSendResult =
    {success: true;} |
    {success: false; error: SignAndSendError}

export interface AppState {
    signedInAs?: string;
    signIn: () => Promise<SignInResult>;
    signOut: () => void;
    
    messages: Message[];
    signAndSendMessage: (message: string) => Promise<SignAndSendResult>;

    tokens: Token[];
    loadTokens: () => Promise<void>;
}

export const initStore = 
    (wallet: WalletAccessor, onChain: RPCAccessor, storage: StorageAccessor) =>
        create<AppState>((set, get) => {
            function signOut() {
                storage.set({user: undefined});
                set({signedInAs: undefined, messages: [], tokens: []});
            }

            const messages = (storage.get('messages') ?? []).filter(({author, signature, message}) =>
                wallet.isSignatureValid(message, author, signature));
            storage.set({messages});

            const user = storage.get('user');
            let signedInAs: string | undefined = undefined;
            if (user !== undefined) {
                if (wallet.isSignatureValid(user.signInMessage, user.address, user.signInSignature)) {
                    signedInAs = user.address;
                } else {
                    storage.set({user: undefined});
                }
            }

            return {
                signedInAs,
                signIn: async () => {
                    const result = await wallet.connect();
                    if (result.connected) {
                        const {address, signInMessage, signInSignature} = result;
                        storage.set({user: {address, signInMessage, signInSignature}});
                        set({signedInAs: address});
                        return {success: true, address};
                    } else {
                        const errors: {[e in ConnectError]: SignInError} = {
                            [ConnectError.NoAccounts]: SignInError.NoAccounts,
                            [ConnectError.TimedOutWaitingForAccount]: SignInError.TimedOutWhileWaitingForAccounts,
                            [ConnectError.NoWalletProviderDetected]: SignInError.NoWalletDetected,
                            [ConnectError.WrongWallet]: SignInError.TallyNotChosen,
                            [ConnectError.UserRejectedConnectRequest]: SignInError.UserDeclinedConnectRequest
                        }
                        return {success: false, error: errors[result.error]};
                    }
                },
                signOut,

                messages,
                signAndSendMessage: async message => {
                    const { signedInAs } = get();
                    if (signedInAs === undefined)
                        return {success: false, error: SignAndSendError.NotSignedIn};
                    const result = await wallet.sign(message, signedInAs);
                    if (result.signed) {
                        const { messages: oldMessages } = get();
                        const signedMessaged: Message = {
                            author: signedInAs,
                            signature: result.signature,
                            message,
                            time: Date.now()
                        };
                        const messages: Message[] = [...oldMessages, signedMessaged];
                        storage.set({messages});
                        set({messages});
                        return {success: true};
                    } else {
                        switch(result.error) {
                            case SignError.AddressMismatch:
                                signOut();
                                return {success: false, error: SignAndSendError.AddressMismatch};
                            case SignError.UserRejectedSignRequest:
                                return {success: false, error: SignAndSendError.UserDeclinedSignRequest};
                        }
                    }
                },

                tokens: [],
                loadTokens: async () => {
                    const { signedInAs } = get();
                    if (signedInAs === undefined)
                        return;
                    const tokens = await onChain.loadTokens(signedInAs);
                    set({tokens});
                }
            }
        }
    );

export const useStore = initStore(TallyWallet, Alchemy, LocalStorage);