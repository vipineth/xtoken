import { useState } from 'react';
import useStakingData from '../lib/useStakingData';

function Sidebar(props) {
  return (
    <>
      <div className='hidden md:flex md:flex-shrink-0'>
        <div className='flex flex-col w-64'>
          {/* <!-- Sidebar component, swap this element with another sidebar if you like --> */}
          <div className='flex flex-col h-0 flex-1'>
            <div className='flex items-center p-4 flex-shrink-0 px-4 bg-gray-900'>
              <img
                className='w-full'
                src='/logo.svg'
                alt='xToken Staking Calculator'
              />
            </div>
            <div className='flex-1 flex flex-col overflow-y-auto'>
              <nav className='flex-1 px-2 py-4 bg-gray-800 space-y-1'>
                {props.sidebarMenuItems?.map((item) => {
                  return (
                    <p
                      className={`text-gray-300 cursor-pointer hover:bg-gray-700 hover:text-white group flex items-center px-2 py-4 text-lg my-2 font-medium rounded-md ${
                        item.symbol === props.activeMenu
                          ? 'active-menu'
                          : ''
                      }`}
                      onClick={() =>
                        props.setActiveMenu(item.symbol)
                      }
                    >
                      <svg
                        className='text-gray-400 group-hover:text-gray-300 mr-3 h-6 w-6'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        aria-hidden='true'
                      >
                        <path
                          stroke-linecap='round'
                          stroke-linejoin='round'
                          stroke-width='2'
                          d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                        ></path>
                      </svg>
                      {item.symbol}
                    </p>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
