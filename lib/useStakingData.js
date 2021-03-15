import { useEffect, useRef, useState } from 'react';
import poolsData from './addresses';
import {
  loadMultipleSynthetixPools,
  provider,
} from './ethers';

export default function useStakingData() {
  const isBrowser = () => typeof window !== 'undefined';

  const [poolsTokens, setPoolsTokens] = useState({});
  useEffect(() => {
    async function main() {
      if (isBrowser()) {
        var App = await provider(window.ethereum);
      }
      let tokens = {};
      let prices = {};

      let pools = await loadMultipleSynthetixPools(
        App,
        {},
        {},
        poolsData
      );

      let keys = Object.keys(pools.tokens);
      let tokensInfo = keys
        .filter((key) =>
          pools.tokens[key].name.startsWith('x')
        )
        .map((key) => pools.tokens[key])
        .map((token) => {
          let poolWithKey = pools.infos.find(
            (pool) =>
              pool.stakingAddress === token.stakingAddress
          );
          return {
            ...token,
            info: { ...poolWithKey },
          };
        });
      setPoolsTokens({ ...pools, tokens: tokensInfo });
    }
    main();
  }, []);
  return { ...poolsTokens };
}
