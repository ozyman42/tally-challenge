import { Button, Label, Table, TextInput } from "flowbite-react";
import React from "react";
import { useStore } from "../state/state";

const NO_INPUT = "";

export const Messages: React.FC = () => {
    const [signAndSendMessage, messages] = useStore(({signAndSendMessage, messages}) => [signAndSendMessage, messages]);
    const [input, setInput] = React.useState(NO_INPUT);
    const disabled = input.length === 0;
    return <div>
        <form onSubmit={e => { e.preventDefault(); if (!disabled) { signAndSendMessage(input).then(() => { setInput(NO_INPUT); }); } }}>
            <Label>New Message</Label>
            <TextInput
                id="large"
                type="text"
                sizing="lg"
                value={input}
                onChange={e => {setInput(e.target.value)}}
            />
            <div className="py-1">
                <Button type='submit' disabled={disabled}>
                    Sign & Save
                </Button>
            </div>
        </form>
        <Table striped={true}>
            <Table.Head>
                <Table.HeadCell>
                    Sender Address
                </Table.HeadCell>
                <Table.HeadCell>
                    Message
                </Table.HeadCell>
                <Table.HeadCell>
                    Sent At
                </Table.HeadCell>
                <Table.HeadCell>
                    Signature
                </Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {messages.map((message, i) => <Table.Row key={i}>
                    <Table.Cell>
                        {message.author}
                    </Table.Cell>
                    <Table.Cell>
                        {message.message}
                    </Table.Cell>
                    <Table.Cell>
                        {new Date(message.time).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                        {message.signature}
                    </Table.Cell>
                </Table.Row>)}
            </Table.Body>
        </Table>
    </div>
}