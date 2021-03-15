import Card from './card';

function Main(props) {
  return (
    <>
      <div class='flex flex-col w-0 flex-1 overflow-hidden'>
        <main
          class='flex-1 relative overflow-y-auto focus:outline-none'
          tabindex='0'
          x-data=''
        >
          <div class='py-6'>
            <div class='max-w-7xl mx-auto px-4 sm:px-6 md:px-8'>
              <h1 class='text-2xl font-semibold text-gray-900'>
                Staking Returns Dashboard
              </h1>
            </div>
            <div class='max-w-7xl mx-auto px-4 sm:px-6 md:px-8'>
              <Card activeToken={props.activeToken} />

              {/* <!-- /End replace --> */}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Main;
