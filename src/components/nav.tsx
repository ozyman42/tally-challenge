import { Alert, Button, DarkThemeToggle, Navbar } from "flowbite-react";
import React from "react";
import { useStore } from "../state/state";

export const Nav: React.FC = () => {
    const {signedInAs, signOut} = 
        useStore(({signedInAs, signOut}) => ({signedInAs, signOut}));
    return <div className="fixed w-full top-0 left-0">
        <Navbar fluid={true} rounded={false}>
            <Navbar.Brand />
            <Navbar.Toggle />
            <Navbar.Collapse>
                {signedInAs !== undefined && <>
                    <div className="py-1"><Button onClick={() => { signOut(); }}>Sign Out</Button></div>
                    <Alert color='success'>{signedInAs}</Alert>
                </>}
                <DarkThemeToggle />
            </Navbar.Collapse>
        </Navbar>
    </div>
}