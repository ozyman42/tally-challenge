import { Button, Label, Table, TextInput } from "flowbite-react";
import React from "react";
import { useStore } from "../state/state";

export const Messages: React.FC = () => {
    const [signAndSendMessage, messages] = useStore(({signAndSendMessage, messages}) => [signAndSendMessage, messages]);
    const [input, setInput] = React.useState("");
    const disabled = input.length === 0;
    return <div>
        <Label>New Message</Label>
        <TextInput
            id="large"
            type="text"
            sizing="lg"
            value={input}
            onChange={e => {setInput(e.target.value)}}
        />
        <div className="pt-2">
            <Button disabled={disabled} onClick={() => { if (!disabled) { signAndSendMessage(input); } }}>
                Sign & Save
            </Button>
        </div>
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
            {messages.map((message, i) => <Table.Row key={i}>
                <Table.Cell>
                    {message.author}
                </Table.Cell>
                <Table.Cell>
                    {message.message}
                </Table.Cell>
                <Table.Cell>
                    {new Date(message.time).toUTCString()}
                </Table.Cell>
                <Table.Cell>
                    {message.signature}
                </Table.Cell>
            </Table.Row>)}
        </Table>
    </div>
}