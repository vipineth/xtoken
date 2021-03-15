import { XTOKEN_ABI } from './abi';

const pools = [
  '0x57c4dF90572dff9E9e3fb5DA28ae2Ba4153Ed2C4',
  '0x1c65b1763eEE90fca83E65F14bB1d63c5280c651',
  '0xdeD9027b1080ecaD13645d099D879920e4229a73',
  '0xb9239B6B78EB6B50d095343C6bCF3bEfeFA4ca94',
  '0xbbdE5e482A0760DfA5dbEa989D6010b3f140A8BC',
  '0x24f50Af486398Df8b715e4B1D85a05BA84fE5822',
  '0xB79bE228B1ac262aa96A8B9Cd647C25D70F125A4',
  '0x9203dCd91Fbbc9FB62D345B93C15B30141B92C3c',
];

const poolsData = pools.map((addr) => {
  return {
    address: addr,
    abi: XTOKEN_ABI,
    stakeTokenFunction: 'stakingToken',
    rewardTokenFunction: 'rewardsToken',
  };
});

export const images = {
  xAAVE: 'https://xtoken.cafe/svgs/token/xaave.svg',
  xKNC: 'https://xtoken.cafe/svgs/token/xknc.svg',
  xSNX: 'https://xtoken.cafe/svgs/token/xsnx.svg',
  xToken: 'https://xtoken.cafe/svgs/token/xtk.svg',
  xINCH: 'https://xtoken.cafe/svgs/token/xinch.svg',
};

export default poolsData;
