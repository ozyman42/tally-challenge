import { BigNumber, ethers } from "ethers";
import { Button, Spinner, Table } from "flowbite-react";
import React, { useState } from "react";
import { useStore } from "../state/state";

export const Tokens: React.FC = () => {
    const [tokens, loadTokens] = useStore(({tokens, loadTokens}) => [tokens, loadTokens]);
    const [loading, setLoading] = useState(false);
    return <>
        <div className="pb-2">
            <Button onClick={() => { 
                setLoading(true);
                loadTokens().finally(() => { setLoading(false); });
            }} >
                {loading && <span className="pr-2">
                    <Spinner aria-label="Refreshing..." />
                </span>}
                Refresh List
            </Button>
        </div>
        <Table striped={true}>
            <Table.Head>
                <Table.HeadCell>
                    Token Icon
                </Table.HeadCell>
                <Table.HeadCell>
                    Current balance
                </Table.HeadCell>
                <Table.HeadCell>
                    Token symbol
                </Table.HeadCell>
                <Table.HeadCell>
                    Token name
                </Table.HeadCell>
                <Table.HeadCell>
                    Token contract address
                </Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {tokens.map((token, i) => <Table.Row key={i}>
                    <Table.Cell>
                        <img width={20} src={token.metadata.iconURI} alt={token.metadata.symbol} />
                    </Table.Cell>
                    <Table.Cell>
                        {ethers.utils.formatUnits(token.amount, token.metadata.decimals)}
                    </Table.Cell>
                    <Table.Cell>
                        {token.metadata.symbol}                     
                    </Table.Cell>
                    <Table.Cell>
                        {token.metadata.name}
                    </Table.Cell>
                    <Table.Cell>
                        {token.metadata.address}
                    </Table.Cell>
                </Table.Row>)}
            </Table.Body>
        </Table>
    </>
}