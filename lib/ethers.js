import { ethers } from 'ethers';
import { Contract, Provider } from 'ethcall';
// import { InfuraProvider } from '@ethersproject/providers';
import {
  BALANCER_POOL_ABI,
  ERC20_ABI,
  UNI_ABI,
} from './abi';

export function formatMoney(
  amount,
  decimalCount = 2,
  decimal = '.',
  thousands = ','
) {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? '-' : '';

    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(
        decimalCount
      ))
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : '') +
      i
        .substr(j)
        .replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : '')
    );
  } catch (e) {
    console.log(e);
  }
}

async function printSynthetixPool(App, info) {
  console.log(App, info, 'from print');
  info.poolPrices.print_price();
  console.log(
    `${
      info.rewardTokenTicker
    } Per Week: ${info.weeklyRewards.toFixed(
      2
    )} ($${formatMoney(info.usdPerWeek)})`
  );
  const weeklyAPY =
    (info.usdPerWeek / info.staked_tvl) * 100;
  const dailyAPY = weeklyAPY / 7;
  const yearlyAPY = weeklyAPY * 52;
  console.log(
    `APY: Day ${dailyAPY.toFixed(
      2
    )}% Week ${weeklyAPY.toFixed(
      2
    )}% Year ${yearlyAPY.toFixed(2)}%`
  );
  const userStakedUsd =
    info.userStaked * info.stakeTokenPrice;
  const userStakedPct =
    (userStakedUsd / info.staked_tvl) * 100;
  console.log(
    `You are staking ${info.userStaked.toFixed(6)} ${
      info.stakeTokenTicker
    } ` +
      `$${formatMoney(
        userStakedUsd
      )} (${userStakedPct.toFixed(2)}% of the pool).`
  );
  if (info.userStaked > 0) {
    info.poolPrices.print_contained_price(info.userStaked);
    const userWeeklyRewards =
      (userStakedPct * info.weeklyRewards) / 100;
    const userDailyRewards = userWeeklyRewards / 7;
    const userYearlyRewards = userWeeklyRewards * 52;
    console.log(
      `Estimated ${info.rewardTokenTicker} earnings:` +
        ` Day ${userDailyRewards.toFixed(
          2
        )} ($${formatMoney(
          userDailyRewards * info.rewardTokenPrice
        )})` +
        ` Week ${userWeeklyRewards.toFixed(
          2
        )} ($${formatMoney(
          userWeeklyRewards * info.rewardTokenPrice
        )})` +
        ` Year ${userYearlyRewards.toFixed(
          2
        )} ($${formatMoney(
          userYearlyRewards * info.rewardTokenPrice
        )})`
    );
  }
  const approveTENDAndStake = async function () {
    return rewardsContract_stake(
      info.stakeTokenAddress,
      info.stakingAddress,
      App
    );
  };
  const unstake = async function () {
    return rewardsContract_unstake(
      info.stakingAddress,
      App
    );
  };
  const claim = async function () {
    return rewardsContract_claim(info.stakingAddress, App);
  };
  const exit = async function () {
    return rewardsContract_exit(info.stakingAddress, App);
  };
  const revoke = async function () {
    return rewardsContract_resetApprove(
      info.stakeTokenAddress,
      info.stakingAddress,
      App
    );
  };
  console.log(
    `<a target="_blank" href="https://etherscan.io/address/${info.stakingAddress}#code">Etherscan</a>`
  );
  console.log(
    `Stake ${info.userUnstaked.toFixed(6)} ${
      info.stakeTokenTicker
    }`,
    approveTENDAndStake
  );
  console.log(
    `Unstake ${info.userStaked.toFixed(6)} ${
      info.stakeTokenTicker
    }`,
    unstake
  );
  console.log(
    `Claim ${info.earned.toFixed(6)} ${
      info.rewardTokenTicker
    } ($${formatMoney(
      info.earned * info.rewardTokenPrice
    )})`,
    claim
  );
  console.log(`Revoke (set approval to 0)`, revoke);
  console.log(`Exit`, exit);
  console.log(`\n`);

  return {
    staked_tvl: info.poolPrices.staked_tvl,
    userStaked: userStakedUsd,
    apy: yearlyAPY,
  };
}

function getUniPrices(tokens, prices, pool) {
  var t0 = getParameterCaseInsensitive(tokens, pool.token0);
  var p0 = getParameterCaseInsensitive(prices, pool.token0)
    ?.usd;
  var t1 = getParameterCaseInsensitive(tokens, pool.token1);
  var p1 = getParameterCaseInsensitive(prices, pool.token1)
    ?.usd;
  if (p0 == null && p1 == null) {
    return undefined;
  }
  var q0 = pool.q0 / 10 ** t0.decimals;
  var q1 = pool.q1 / 10 ** t1.decimals;
  if (p0 == null) {
    p0 = (q1 * p1) / q0;
    prices[pool.token0] = { usd: p0 };
  }
  if (p1 == null) {
    p1 = (q0 * p0) / q1;
    prices[pool.token1] = { usd: p1 };
  }
  var tvl = q0 * p0 + q1 * p1;
  var price = tvl / pool.totalSupply;
  prices[pool.address] = { usd: price };
  var staked_tvl = pool.staked * price;
  let stakeTokenTicker = `[${t0.symbol}]-[${t1.symbol}]`;
  if (pool.is1inch) stakeTokenTicker += ' 1INCH LP';
  else if (pool.symbol.includes('LSLP'))
    stakeTokenTicker += ' LSLP';
  else if (pool.symbol.includes('SLP'))
    stakeTokenTicker += ' SLP';
  else if (pool.symbol.includes('Cake'))
    stakeTokenTicker += ' Cake LP';
  else stakeTokenTicker += ' Uni LP';
  return {
    t0: t0,
    p0: p0,
    q0: q0,
    t1: t1,
    p1: p1,
    q1: q1,
    price: price,
    tvl: tvl,
    staked_tvl: staked_tvl,
    stakeTokenTicker: stakeTokenTicker,
    print_price() {
      const poolUrl = pool.is1inch
        ? 'https://1inch.exchange/#/dao/pools'
        : pool.symbol.includes('LSLP')
        ? `https://info.linkswap.app/pair/${pool.address}`
        : pool.symbol.includes('SLP')
        ? `http://sushiswap.fi/pair/${pool.address}`
        : pool.symbol.includes('Cake-LP')
        ? `https://pancakeswap.info/pair/${pool.address}`
        : `http://uniswap.info/pair/${pool.address}`;
      const t0address =
        t0.symbol == 'ETH' ? 'ETH' : t0.address;
      const t1address =
        t1.symbol == 'ETH' ? 'ETH' : t1.address;
      const helperUrls = pool.is1inch
        ? []
        : pool.symbol.includes('LSLP')
        ? [
            `https://linkswap.app/#/add/${t0address}/${t1address}`,
            `https://linkswap.app/#/remove/${t0address}/${t1address}`,
            `https://linkswap.app/#/swap?inputCurrency=${t0address}&outputCurrency=${t1address}`,
          ]
        : pool.symbol.includes('Cake-LP')
        ? [
            `https://exchange.pancakeswap.finance/#/add/${t0address}/${t1address}`,
            `https://exchange.pancakeswap.finance/#/remove/${t0address}/${t1address}`,
            `https://exchange.pancakeswap.finance/#/swap?inputCurrency=${t0address}&outputCurrency=${t1address}`,
          ]
        : pool.symbol.includes('SLP')
        ? [
            `https://exchange.sushiswapclassic.org/#/add/${t0address}/${t1address}`,
            `https://exchange.sushiswapclassic.org/#/remove/${t0address}/${t1address}`,
            `https://exchange.sushiswapclassic.org/#/swap?inputCurrency=${t0address}&outputCurrency=${t1address}`,
          ]
        : [
            `https://app.uniswap.org/#/add/${t0address}/${t1address}`,
            `https://app.uniswap.org/#/remove/${t0address}/${t1address}`,
            `https://app.uniswap.org/#/swap?inputCurrency=${t0address}&outputCurrency=${t1address}`,
          ];
      const helperHrefs =
        helperUrls.length == 0
          ? ''
          : ` <a href='${helperUrls[0]}' target='_blank'>[+]</a> <a href='${helperUrls[1]}' target='_blank'>[-]</a> <a href='${helperUrls[2]}' target='_blank'>[<=>]</a>`;
      console.log(
        `<a href='${poolUrl}' target='_blank'>${stakeTokenTicker}</a>${helperHrefs} Price: $${formatMoney(
          price
        )} TVL: $${formatMoney(tvl)}`
      );
      console.log(
        `${t0.symbol} Price: $${formatMoney(p0)}`
      );
      console.log(
        `${t1.symbol} Price: $${formatMoney(p1)}`
      );
      console.log(
        `Staked: ${pool.staked.toFixed(4)} ${
          pool.symbol
        } ($${formatMoney(staked_tvl)})`
      );
    },
    print_contained_price(userStaked) {
      var userPct = userStaked / pool.totalSupply;
      var q0user = userPct * q0;
      var q1user = userPct * q1;
      console.log(
        `Your LP tokens comprise of ${q0user.toFixed(4)} ${
          t0.symbol
        } + ${q1user.toFixed(4)} ${t1.symbol}`
      );
    },
  };
}

function getBalancerPrices(tokens, prices, pool) {
  var poolTokens = pool.poolTokens.map((t) =>
    getParameterCaseInsensitive(tokens, t.address)
  );
  var poolPrices = pool.poolTokens.map(
    (t) =>
      getParameterCaseInsensitive(prices, t.address)?.usd
  );
  var quantities = poolTokens.map(
    (t, i) => pool.poolTokens[i].balance / 10 ** t.decimals
  );
  var missing = poolPrices.filter((x) => !x);
  if (missing.length == poolPrices.length) {
    throw 'Every price is missing';
  }
  var notMissing = poolPrices.findIndex((p) => p);
  const getMissingPrice = (
    missingQuantity,
    missingWeight
  ) =>
    (quantities[notMissing] *
      poolPrices[notMissing] *
      missingWeight) /
    pool.poolTokens[notMissing].weight /
    missingQuantity;
  missing.map((_, i) => {
    const newPrice = getMissingPrice(
      quantities[i],
      pool.poolTokens[i].weight
    );
    poolPrices[i] = newPrice;
    prices[poolTokens[i].address] = { usd: newPrice };
  });

  var tvl = poolPrices
    .map((p, i) => p * quantities[i])
    .reduce((x, y) => x + y, 0);
  var price = tvl / pool.totalSupply;
  prices[pool.address] = { usd: price };
  var staked_tvl = pool.staked * price;
  var tickers = pool.poolTokens.map(
    (pt, i) =>
      `[${poolTokens[i].symbol} ${pt.weight * 100}%]`
  );
  const stakeTokenTicker = tickers.join('-');
  return {
    tokens: poolTokens,
    prices: poolPrices,
    quantities: quantities,
    price: price,
    tvl: tvl,
    staked_tvl: staked_tvl,
    stakeTokenTicker: stakeTokenTicker,
    print_price() {
      const poolUrl = `http://pools.balancer.exchange/#/pool/${pool.address}`;
      console.log(
        `<a href='${poolUrl}' target='_blank'>${stakeTokenTicker}</a> BPT Price: $${formatMoney(
          price
        )} TVL: $${formatMoney(tvl)}`
      );
      poolPrices.forEach((p, i) =>
        console.log(
          `${poolTokens[i].symbol} Price: $${formatMoney(
            p
          )}`
        )
      );
      console.log(
        `Staked: ${pool.staked.toFixed(
          4
        )} ${stakeTokenTicker} ($${formatMoney(
          staked_tvl
        )})`
      );
    },
    print_contained_price(userStaked) {
      var userPct = userStaked / pool.totalSupply;
      var userQs = quantities.map(
        (q, i) =>
          `${(q * userPct).toFixed(4)} ${
            poolTokens[i].symbol
          }`
      );
      console.log(
        `Your LP tokens comprise of ${userQs.join(' + ')}`
      );
    },
  };
}

function getWrapPrices(tokens, prices, pool) {
  const wrappedToken = pool.token;
  if (wrappedToken.token0 != null) {
    //Uniswap
    const uniPrices = getUniPrices(
      tokens,
      prices,
      wrappedToken
    );
    const poolUrl = pool.is1inch
      ? 'https://1inch.exchange/#/dao/pools'
      : pool.symbol.includes('SLP')
      ? `http://sushiswap.fi/pair/${wrappedToken.address}`
      : pool.symbol.includes('Cake')
      ? `http://pancakeswap.info/pair/${wrappedToken.address}`
      : `http://uniswap.info/pair/${wrappedToken.address}`;
    const name = `Wrapped <a href='${poolUrl}' target='_blank'>${uniPrices.stakeTokenTicker}</a>`;
    const price =
      ((pool.balance / 10 ** wrappedToken.decimals) *
        uniPrices.price) /
      (pool.totalSupply / 10 ** pool.decimals);
    const tvl =
      (pool.balance / 10 ** wrappedToken.decimals) * price;
    const staked_tvl = pool.staked * price;

    prices[pool.address] = { usd: price };
    return {
      tvl: tvl,
      staked_tvl: staked_tvl,
      price: price,
      stakeTokenTicker: pool.symbol,
      print_price() {
        console.log(
          `${name} Price: $${formatMoney(
            price
          )} TVL: $${formatMoney(tvl)}`
        );
        console.log(
          `Staked: ${pool.staked.toFixed(4)} ${
            pool.symbol
          } ($${formatMoney(staked_tvl)})`
        );
      },
      print_contained_price(_) {},
    };
  } else {
    let tokenPrice = 0;
    if (wrappedToken.token != null) {
      //e.g. stakedao crv token vault
      const pp = getPoolPrices(
        tokens,
        prices,
        wrappedToken.token
      );
      tokenPrice = pp.price;
    } else {
      tokenPrice = getParameterCaseInsensitive(
        prices,
        wrappedToken.address
      )?.usd;
    }
    const price =
      ((pool.balance / 10 ** wrappedToken.decimals) *
        tokenPrice) /
      (pool.totalSupply / 10 ** pool.decimals);
    const tvl =
      (pool.balance / 10 ** wrappedToken.decimals) * price;
    const staked_tvl = pool.staked * price;
    prices[pool.address] = { usd: price };
    return {
      tvl: tvl,
      staked_tvl: staked_tvl,
      price: price,
      stakeTokenTicker: pool.symbol,
      print_price() {
        console.log(
          `${pool.symbol} Price: $${formatMoney(
            price
          )} TVL: $${formatMoney(tvl)}`
        );
        console.log(
          `Staked: ${pool.staked.toFixed(4)} ${
            pool.symbol
          } ($${formatMoney(staked_tvl)})`
        );
      },
      print_contained_price(_) {},
    };
  }
}

function getErc20Prices(prices, pool, isBsc = false) {
  var price = getParameterCaseInsensitive(
    prices,
    pool.address
  )?.usd;
  var tvl =
    (pool.totalSupply * price) / 10 ** pool.decimals;
  var staked_tvl = pool.staked * price;
  const poolUrl = isBsc
    ? `https://bscscan.com/token/${pool.address}`
    : `https://etherscan.io/token/${pool.address}`;
  const name = `<a href='${poolUrl}' target='_blank'>${pool.symbol}</a>`;
  return {
    staked_tvl: staked_tvl,
    price: price,
    stakeTokenTicker: pool.symbol,
    print_price() {
      console.log(
        `${name} Price: $${formatMoney(
          price
        )} Market Cap: $${formatMoney(tvl)}`
      );
      console.log(
        `Staked: ${pool.staked.toFixed(4)} ${
          pool.symbol
        } ($${formatMoney(staked_tvl)})`
      );
    },
    print_contained_price() {},
  };
}

function getCurvePrices(prices, pool) {
  var price =
    getParameterCaseInsensitive(prices, pool.token.address)
      ?.usd * pool.virtualPrice;
  var tvl =
    (pool.totalSupply * price) / 10 ** pool.decimals;
  var staked_tvl = pool.staked * price;
  const poolUrl = `https://etherscan.io/token/${pool.address}`;
  const name = `<a href='${poolUrl}' target='_blank'>${pool.symbol}</a>`;
  return {
    staked_tvl: staked_tvl,
    price: price,
    stakeTokenTicker: pool.symbol,
    print_price() {
      console.log(
        `${name} Price: $${formatMoney(
          price
        )} Market Cap: $${formatMoney(tvl)}`
      );
      console.log(
        `Staked: ${pool.staked.toFixed(4)} ${
          pool.symbol
        } ($${formatMoney(staked_tvl)})`
      );
    },
    print_contained_price() {},
  };
}

function getPoolPrices(
  tokens,
  prices,
  pool,
  isBsc = false
) {
  if (pool.poolTokens != null)
    return getBalancerPrices(tokens, prices, pool);
  if (pool.token0 != null)
    return getUniPrices(tokens, prices, pool);
  if (pool.virtualPrice != null)
    return getCurvePrices(prices, pool);
  if (pool.token != null)
    return getWrapPrices(tokens, prices, pool);
  return getErc20Prices(prices, pool, isBsc);
}
const chunk = (arr, n) =>
  arr.length
    ? [arr.slice(0, n), ...chunk(arr.slice(n), n)]
    : [];
const lookUpTokenPrices = async function (id_array) {
  const prices = {};
  for (const id_chunk of chunk(id_array, 50)) {
    let ids = id_chunk.join('%2C');
    let res = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${ids}&vs_currencies=usd`
    ).then((res) => res.json());
    for (const [key, v] of Object.entries(res)) {
      if (v.usd) prices[key] = v;
    }
  }
  return prices;
};

function getParameterCaseInsensitive(object, key) {
  return object[
    Object.keys(object).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    )
  ];
}

export async function provider(eth) {
  let App = {};

  try {
    // Request account access
    const accounts = await eth.request({
      method: 'eth_requestAccounts',
    });
    App.YOUR_ADDRESS = accounts[0];
  } catch (error) {
    // User denied account access...
    console.error('User denied account access');
  }
  App.provider = new ethers.providers.JsonRpcProvider(
    'https://eth-mainnet.alchemyapi.io/v2/a3-z_Ardjylaz_iMIGe6uAYPFTPvmAU7'
  );

  App.ethcallProvider = new Provider();
  await App.ethcallProvider.init(App.provider);

  return App;
}
async function getUniPool(
  app,
  pool,
  poolAddress,
  stakingAddress
) {
  const calls = [
    pool.decimals(),
    pool.token0(),
    pool.token1(),
    pool.symbol(),
    pool.name(),
    pool.totalSupply(),
    pool.balanceOf(stakingAddress),
    pool.balanceOf(app.YOUR_ADDRESS),
  ];
  const [
    decimals,
    token0,
    token1,
    symbol,
    name,
    totalSupply,
    staked,
    unstaked,
  ] = await app.ethcallProvider.all(calls);
  let q0, q1, is1inch;
  try {
    const [reserves] = await app.ethcallProvider.all([
      pool.getReserves(),
    ]);
    q0 = reserves._reserve0;
    q1 = reserves._reserve1;
    is1inch = false;
  } catch {
    //for 1inch
    if (
      token0 == '0x0000000000000000000000000000000000000000'
    ) {
      q0 = await app.provider.getBalance(poolAddress);
    } else {
      const c0 = new ethers.Contract(
        token0,
        ERC20_ABI,
        app.provider
      );
      q0 = await c0.balanceOf(poolAddress);
    }
    if (
      token1 == '0x0000000000000000000000000000000000000000'
    ) {
      q1 = await app.provider.getBalance(poolAddress);
    } else {
      const c1 = new ethers.Contract(
        token1,
        ERC20_ABI,
        app.provider
      );
      q1 = await c1.balanceOf(poolAddress);
    }
    is1inch = true;
  }
  return {
    symbol,
    name,
    address: poolAddress,
    token0: token0,
    q0,
    token1: token1,
    q1,
    totalSupply: totalSupply / 10 ** decimals,
    stakingAddress: stakingAddress,
    staked: staked / 10 ** decimals,
    decimals: decimals,
    unstaked: unstaked / 10 ** decimals,
    contract: pool,
    tokens: [token0, token1],
    is1inch,
  };
}

async function getErc20(
  app,
  token,
  address,
  stakingAddress
) {
  if (
    address == '0x0000000000000000000000000000000000000000'
  ) {
    return {
      address,
      name: 'Ethereum',
      symbol: 'ETH',
      totalSupply: 1e8,
      decimals: 18,
      staked: 0,
      unstaked: 0,
      contract: null,
      tokens: [address],
    };
  }
  const calls = [
    token.decimals(),
    token.balanceOf(stakingAddress),
    token.balanceOf(app.YOUR_ADDRESS),
    token.name(),
    token.symbol(),
    token.totalSupply(),
  ];
  const [
    decimals,
    staked,
    unstaked,
    name,
    symbol,
    totalSupply,
  ] = await app.ethcallProvider.all(calls);
  return {
    address,
    name,
    symbol,
    totalSupply,
    decimals: decimals,
    staked: staked / 10 ** decimals,
    unstaked: unstaked / 10 ** decimals,
    contract: token,
    tokens: [address],
    stakingAddress,
  };
}
async function getBalancerPool(
  app,
  pool,
  poolAddress,
  stakingAddress,
  tokens,
  smartToken
) {
  const tokenCalls = tokens
    .map((t) => [
      pool.getNormalizedWeight(t),
      pool.getBalance(t),
    ])
    .flat();
  const calls = [
    pool.decimals(),
    pool.symbol(),
    pool.name(),
    pool.totalSupply(),
    pool.balanceOf(stakingAddress),
    pool.balanceOf(app.YOUR_ADDRESS),
  ].concat(tokenCalls);
  const results = await app.ethcallProvider.all(calls);
  let [
    decimals,
    symbol,
    name,
    totalSupply,
    staked,
    unstaked,
  ] = results;
  let poolTokens = [];
  let j = 0;
  for (let i = 6; i < results.length; i += 2) {
    poolTokens.push({
      address: tokens[j],
      weight: results[i] / 1e18,
      balance: results[i + 1],
    });
    j++;
  }
  if (smartToken) {
    [
      totalSupply,
      staked,
      unstaked,
    ] = await app.ethcallProvider.all([
      smartToken.totalSupply(),
      smartToken.balanceOf(stakingAddress),
      smartToken.balanceOf(app.YOUR_ADDRESS),
    ]);
  }
  return {
    symbol,
    name,
    address: poolAddress,
    poolTokens, //address, weight and balance
    totalSupply: totalSupply / 10 ** decimals,
    stakingAddress,
    staked: staked / 10 ** decimals,
    decimals: decimals,
    unstaked: unstaked / 10 ** decimals,
    contract: pool,
    tokens,
    stakingAddress,
  };
}

function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = '';
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(
      parseInt(hex.substr(n, 2), 16)
    );
  }
  return str;
}

async function getStoredToken(
  app,
  tokenAddress,
  stakingAddress,
  type
) {
  switch (type) {
    case 'uniswap':
      const pool = new Contract(tokenAddress, UNI_ABI);
      return await getUniPool(
        app,
        pool,
        tokenAddress,
        stakingAddress
      );
    case 'balancer':
      const bal = new Contract(
        tokenAddress,
        BALANCER_POOL_ABI
      );
      const [tokens] = await app.ethcallProvider.all([
        bal.getFinalTokens(),
      ]);
      return await getBalancerPool(
        app,
        bal,
        tokenAddress,
        stakingAddress,
        tokens
      );

    case 'erc20':
      const erc20 = new Contract(tokenAddress, ERC20_ABI);
      return await getErc20(
        app,
        erc20,
        tokenAddress,
        stakingAddress
      );
  }
}
async function getToken(app, tokenAddress, stakingAddress) {
  if (
    tokenAddress ==
    '0x0000000000000000000000000000000000000000'
  ) {
    return getErc20(app, null, tokenAddress, '');
  }

  const type = window.localStorage.getItem(tokenAddress);
  //getTokenWeights
  if (type)
    return getStoredToken(
      app,
      tokenAddress,
      stakingAddress,
      type
    );

  if (
    tokenAddress ===
      '0x33812E984D49eD5b44d75A008c12060E5076238C' ||
    tokenAddress ===
      '0xE3f9cF7D44488715361581DD8B3a15379953eB4C' ||
    tokenAddress ===
      '0xd9346Ab5a2Ed5e32F5fC69a5CccF45211307FFC5'
  ) {
    const bal = new Contract(
      tokenAddress,
      BALANCER_POOL_ABI
    );
    const [tokens] = await app.ethcallProvider.all([
      bal.getFinalTokens(),
    ]);
    const balPool = await getBalancerPool(
      app,
      bal,
      tokenAddress,
      stakingAddress,
      tokens
    );
    window.localStorage.setItem(tokenAddress, 'balancer');
    console.log(bal, balPool, 'pool');
    return balPool;
  }
  try {
    const pool = new Contract(tokenAddress, UNI_ABI);
    const _token0 = await app.ethcallProvider.all([
      pool.token0(),
    ]);
    const uniPool = await getUniPool(
      app,
      pool,
      tokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, 'uniswap');
    return uniPool;
  } catch (err) {}
  try {
    console.log(`try ${tokenAddress}`);
    const bal = new Contract(
      tokenAddress,
      BALANCER_POOL_ABI
    );
    const [tokens] = await app.ethcallProvider.all([
      bal.getFinalTokens(),
    ]);
    const balPool = await getBalancerPool(
      app,
      bal,
      tokenAddress,
      stakingAddress,
      tokens
    );
    window.localStorage.setItem(tokenAddress, 'balancer');
    return balPool;
  } catch (err) {}
  try {
    const erc20 = new Contract(tokenAddress, ERC20_ABI);
    const _name = await app.ethcallProvider.all([
      erc20.name(),
    ]);
    const erc20tok = await getErc20(
      app,
      erc20,
      tokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, 'erc20');
    return erc20tok;
  } catch (err) {}
}

async function loadSynthetixPoolInfo(
  App,
  tokens,
  prices,
  stakingAbi,
  stakingAddress,
  rewardTokenFunction,
  stakeTokenFunction
) {
  const STAKING_POOL = new ethers.Contract(
    stakingAddress,
    stakingAbi,
    App.provider
  );
  const STAKING_MULTI = new Contract(
    stakingAddress,
    stakingAbi
  );

  if (!STAKING_POOL.callStatic[stakeTokenFunction]) {
    console.log(
      "Couldn't find stake function ",
      stakeTokenFunction
    );
  }
  const stakeTokenAddress = await STAKING_POOL.callStatic[
    stakeTokenFunction
  ]();

  const rewardTokenAddress = await STAKING_POOL.callStatic[
    rewardTokenFunction
  ]();

  var stakeToken = await getToken(
    App,
    stakeTokenAddress,
    stakingAddress
  );

  if (
    stakeTokenAddress.toLowerCase() ===
    rewardTokenAddress.toLowerCase()
  ) {
    stakeToken.staked =
      (await STAKING_POOL.totalSupply()) /
      10 ** stakeToken.decimals;
  }

  var newPriceAddresses = stakeToken.tokens.filter(
    (x) =>
      x.toLowerCase() !=
        '0xb34ab2f65c6e4f764ffe740ab83f982021faed6d' && //BSG can't be retrieved from Coingecko
      !getParameterCaseInsensitive(prices, x)
  );
  var newPrices = await lookUpTokenPrices(
    newPriceAddresses
  );
  for (const key in newPrices) {
    if (newPrices[key]?.usd) prices[key] = newPrices[key];
  }
  var newTokenAddresses = stakeToken.tokens.filter(
    (x) => !getParameterCaseInsensitive(tokens, x)
  );
  for (const address of newTokenAddresses) {
    tokens[address] = await getToken(
      App,
      address,
      stakingAddress
    );
  }
  if (
    !getParameterCaseInsensitive(tokens, rewardTokenAddress)
  ) {
    tokens[rewardTokenAddress] = await getToken(
      App,
      rewardTokenAddress,
      stakingAddress
    );
  }
  const rewardToken = getParameterCaseInsensitive(
    tokens,
    rewardTokenAddress
  );

  const rewardTokenTicker = rewardToken.symbol;

  const poolPrices = getPoolPrices(
    tokens,
    prices,
    stakeToken
  );

  const stakeTokenTicker = poolPrices.stakeTokenTicker;

  const stakeTokenPrice =
    prices[stakeTokenAddress]?.usd ??
    getParameterCaseInsensitive(prices, stakeTokenAddress)
      ?.usd;
  const rewardTokenPrice = getParameterCaseInsensitive(
    prices,
    rewardTokenAddress
  )?.usd;

  const calls = [
    STAKING_MULTI.periodFinish(),
    STAKING_MULTI.rewardRate(),
    STAKING_MULTI.balanceOf(App.YOUR_ADDRESS),
    STAKING_MULTI.earned(App.YOUR_ADDRESS),
  ];
  const [
    periodFinish,
    rewardRate,
    balance,
    earned_,
  ] = await App.ethcallProvider.all(calls);
  const weeklyRewards =
    Date.now() / 1000 > periodFinish
      ? 0
      : (rewardRate / 1e18) * 604800;

  const usdPerWeek = weeklyRewards * rewardTokenPrice;

  const staked_tvl = poolPrices.staked_tvl;

  const userStaked = balance / 10 ** stakeToken.decimals;

  const userUnstaked = stakeToken.unstaked;

  const earned = earned_ / 10 ** rewardToken.decimals;

  const weeklyAPR = (usdPerWeek / staked_tvl) * 100;
  const dailyAPR = weeklyAPR / 7;
  const yearlyAPR = weeklyAPR * 52;

  return {
    stakingAddress,
    poolPrices,
    stakeTokenAddress,
    rewardTokenAddress,
    stakeTokenTicker,
    rewardTokenTicker,
    stakeTokenPrice,
    rewardTokenPrice,
    weeklyRewards,
    usdPerWeek,
    staked_tvl,
    userStaked,
    userUnstaked,
    earned,
    weeklyAPR,
    dailyAPR,
    yearlyAPR,
  };
}

export async function loadMultipleSynthetixPools(
  App,
  tokens,
  prices,
  pools
) {
  let totalStaked = 0,
    totalUserStaked = 0,
    individualAPYs = [];
  const infos = await Promise.all(
    pools.map((p) =>
      loadSynthetixPoolInfo(
        App,
        tokens,
        prices,
        p.abi,
        p.address,
        p.rewardTokenFunction,
        p.stakeTokenFunction
      )
    )
  );

  // for (const i of infos) {
  //   let p = await printSynthetixPool(App, i);
  //   totalStaked += p.staked_tvl || 0;
  //   totalUserStaked += p.userStaked || 0;
  //   if (p.userStaked > 0) {
  //     individualAPYs.push((p.userStaked * p.apy) / 100);
  //   }
  // }
  // let totalApy =
  //   totalUserStaked == 0
  //     ? 0
  //     : individualAPYs.reduce((x, y) => x + y, 0) /
  //       totalUserStaked;
  return {
    tokens,
    prices,
    infos,
  };
}
