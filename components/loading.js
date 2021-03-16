function Loading() {
  return (
    <div className='w-full h-full fixed top-0 left-0 bg-pu z-50 bg-color flex justify-center items-center'>
      <div className='flex flex-col justify-center items-center'>
        <div className='donut '></div>
        <p className='text-lg font-bold pt-6 text-white'>
          Loading required data from blockchain!
        </p>
      </div>
    </div>
  );
}

export default Loading;
