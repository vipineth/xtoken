import { useState } from 'react';
import Head from 'next/head';
import Loading from '../components/loading';
import Main from '../components/main';
import Sidebar from '../components/sidebar';
import { images } from '../lib/addresses';

import useStakingData from '../lib/useStakingData';

function getActiveToken(tokens, symbol) {
  if (tokens) {
    return tokens.find((token) => token.symbol === symbol);
  }
}

export default function App() {
  const data = useStakingData();
  const [activeMenu, setActiveMenu] = useState('xAAVEa');

  if (data.tokens && Object.keys(data.tokens).length > 0) {
    var sidebarMenuItems = Object.keys(data.tokens)
      .map((key) => {
        if (data.tokens[key].name.startsWith('x')) {
          return data.tokens[key];
        }
      })
      .filter(Boolean)
      .map((token) => {
        return {
          ...token,
          img: images[token.name],
        };
      })
      .sort((a, b) => {
        return b.symbol.toLowerCase() >
          a.symbol.toLowerCase()
          ? -1
          : 1;
      });
  }

  return (
    <div style={{ minHeight: '640px' }} class='bg-gray-100'>
      <Head>
        <title>xToken Staking Returns Dashboard</title>
        <meta
          name='viewport'
          content='initial-scale=1.0, width=device-width'
        />
      </Head>
      <div class='h-screen flex overflow-hidden bg-gray-100'>
        {data.tokens ? (
          <>
            <Sidebar
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              data={data}
              sidebarMenuItems={sidebarMenuItems}
            />
            <Main
              activeToken={getActiveToken(
                sidebarMenuItems,
                activeMenu
              )}
            />
          </>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}
