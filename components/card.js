import { useState } from 'react';
import { formatMoney } from '../lib/ethers';
import CardStats from './card-stats';

export default function Card(props) {
  const [amount, setAmount] = useState(0);
  const { img, symbol, name, info } = props.activeToken;
  return (
    <div className='bg-gray-100'>
      <div className='max-w-7xl mx-auto py-6'>
        <div className='max-w-none mx-auto'>
          <div className='bg-white overflow-hidden sm:rounded-lg sm:shadow'>
            <div className='bg-white px-4 py-5 border-b border-gray-200 sm:px-6 bg-color'>
              <div className='-ml-4 -mt-4 flex justify-between items-center flex-wrap sm:flex-nowrap'>
                <div className='ml-4 mt-4'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <img
                        className='h-16 w-16 rounded-full'
                        src={img}
                        alt=''
                      />
                    </div>
                    <div className='ml-4'>
                      <h3 className='text-2xl leading-6 text-white font-extrabold'>
                        {`${symbol} (${name})`}
                      </h3>
                      <p className='text-md text-white mt-2'>
                        <a href='#'>
                          {info.stakeTokenTicker}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                <div className='ml-4 mt-4 flex-shrink-0 flex'>
                  <button
                    type='button'
                    className='relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    <span>
                      {'TVL: ' +
                        formatMoney(info.staked_tvl)}
                    </span>
                  </button>
                  <button
                    type='button'
                    className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    <span>
                      {'APR: ' +
                        info.yearlyAPR.toFixed(2) +
                        '%'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className='bg-gray-50 pt-12 sm:pt-16'>
              <div class='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div class='max-w-4xl mx-auto text-center'>
                  <label
                    for='price'
                    className='block sm:text-2xl mb-4 font-bold'
                  >
                    Enter Your Investment
                  </label>
                  <div className='relative mt-1 mx-auto'>
                    <input
                      type='text'
                      name='price'
                      value={amount}
                      onChange={(event) =>
                        setAmount(event.target.value)
                      }
                      id='price'
                      className='mx-auto max-w-sm focus:ring-indigo-500 py-4 focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-500 rounded-md border-2'
                      placeholder='Enter Your Investmant In USD'
                    />
                  </div>
                </div>
              </div>

              <CardStats info={info} amount={amount} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
