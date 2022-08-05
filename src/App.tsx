/* eslint-disable react/style-prop-object */
import { Flowbite, Tabs } from 'flowbite-react';
import React from 'react';
import { Container } from './components/container';
import { Nav } from './components/nav';
import { GiTwoCoins } from 'react-icons/gi';
import { HiChatAlt2 } from 'react-icons/hi';
import { Messages } from './components/messages';
import { Tokens } from './components/tokens';
import { useStore } from './state/state';
import { SignIn } from './components/sign-in';

export const App: React.FC = () => {
  const { signedInAs } = useStore(({signedInAs}) => ({signedInAs}));
  return <div className='min-h-screen dark:bg-gray-900 flex py-28'>
    <Flowbite>
      <Nav />
      <Container>
        {signedInAs === undefined && <SignIn />}
        {signedInAs !== undefined && 
          <Tabs.Group
            aria-label='Pages'
            style={'underline'}
          >
            <Tabs.Item
              title="Messages"
              icon={HiChatAlt2}
            >
              <Messages />
            </Tabs.Item>
            <Tabs.Item
              title="Tokens"
              icon={GiTwoCoins}
            >
              <Tokens />
            </Tabs.Item>
          </Tabs.Group>
        }
      </Container>
    </Flowbite>
  </div>;
}
