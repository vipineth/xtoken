function CardStats(props) {
  function calculate(a = 0, b = 0) {
    if (!a) {
      return 0;
    } else {
      var c = (parseFloat(a) * parseFloat(b)) / 100;
      return parseFloat(c).toFixed(2);
    }
  }
  return (
    <div class='mt-10 pb-12 bg-white sm:pb-16'>
      <div class='relative'>
        <div class='absolute inset-0 h-1/2 bg-gray-50'></div>
        <div class='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div class='max-w-4xl mx-auto'>
            <dl class='rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3'>
              <div class='flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r'>
                <dt class='order-2 mt-2 text-lg leading-6 font-medium text-gray-500'>
                  Estimated Daily Earnings
                </dt>
                <dd class='order-1 text-5xl font-extrabold text-indigo-600'>
                  {calculate(
                    props.amount,
                    props.info.dailyAPR
                  ) + '$'}
                </dd>
              </div>
              <div class='flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r'>
                <dt class='order-2 mt-2 text-lg leading-6 font-medium text-gray-500'>
                  Estimated Weekly Earnings
                </dt>
                <dd class='order-1 text-5xl font-extrabold text-indigo-600'>
                  {calculate(
                    props.amount,
                    props.info.weeklyAPR
                  ) + '$'}
                </dd>
              </div>
              <div class='flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l'>
                <dt class='order-2 mt-2 text-lg leading-6 font-medium text-gray-500'>
                  Estimated Yearly Earnings
                </dt>
                <dd class='order-1 text-5xl font-extrabold text-indigo-600'>
                  {calculate(
                    props.amount,
                    props.info.yearlyAPR
                  ) + '$'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardStats;
