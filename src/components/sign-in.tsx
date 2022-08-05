import { Alert, Button } from "flowbite-react";
import React from "react";
import { SignInError, useStore } from "../state/state";
import { BiErrorCircle } from 'react-icons/bi'

const NO_ERROR = "";

export const SignIn: React.FC = () => {
    const [error, setError] = React.useState(NO_ERROR);
    const signIn = useStore(({ signIn }) => signIn);
    async function attemptSignIn() {
        const result = await signIn();
        if (!result.success) {
            switch(result.error) {
                case SignInError.NoWalletDetected:
                    setError("No wallet was detected. You must install one.");
                    break;
                case SignInError.TallyNotChosen:
                    setError(`You must sign in using the Tally wallet.`);
                    break;
                case SignInError.TimedOutWhileWaitingForAccounts:
                    setError("Timed out before you could select an account.");
                    break;
                case SignInError.NoAccounts:
                    setError("Your wallet has no accounts.");
                    break;
                case SignInError.UserDeclinedConnectRequest:
                    setError(NO_ERROR);
            }
        } else {
            setError(NO_ERROR);
        }
    }
    return <div className="flex flex-col">
        <div className="m-auto">
            <Button onClick={() => { attemptSignIn(); }}>Sign In</Button>
        </div>
        {error && <div className="pt-4 flex">
            <Alert color="failure" icon={BiErrorCircle}>
                {error}
            </Alert>
        </div>}
    </div>
}