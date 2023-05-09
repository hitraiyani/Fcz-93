import React from 'react';
import {useState, useEffect} from 'react';

export default function countdown() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const targetDate = new Date('May 13, 2023 19:27:00').getTime();
      const distance = targetDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown({days, hours, minutes, seconds});
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const formatTime = (time) => {
    return time.toString().padStart(2, '0');
  };
  return (
    <>
      <section className="countdown-sec bg-black">
        <div className="countdown-wrap min-h-screen py-[50px] lg:py-[80px] xl:py-[100px] px-[30px] flex justify-center items-center">
          <div className="h-full">
            <div className="countdown-inner flex flex-col justify-evenly h-full gap-[50px] md:gap-[100px] xl:gap-[120px]">
              <div className="top-title">
                <h1 className=" text-center text-[#efff00] text-[24px] md:text-[28px] leading-[1.2] font-black max-w-[544px] mx-auto uppercase">
                  <span className="text-white block text-center">
                    93. FASHION
                  </span>
                  SOON AVAILABLE
                </h1>
              </div>
              <div className="timer-wrap max-w-[800px] mx-auto">
                <div className="timer-row flex flex-col md:flex-row gap-[77px] justify-between">
                  <div className="day-wrap">
                    <p className="title uppercase text-[24px] md:text-[28px] leading-[1.2] font-black text-white text-center">
                      DAYS
                    </p>
                    <p className="day text-[#efff00] text-[72px] md:text-[84px] leading-none font-black text-center">
                      {formatTime(countdown.days)}
                    </p>
                  </div>
                  <div className="hours-wrap">
                    <p className="title uppercase text-[24px] md:text-[28px] leading-[1.2] font-black text-white text-center">
                      HOURS
                    </p>
                    <p className="day text-[#efff00] text-[72px] md:text-[84px] leading-none font-black text-center">
                      {formatTime(countdown.hours)}
                    </p>
                  </div>
                  <div className="hours-wrap">
                    <p className="title uppercase text-[24px] md:text-[28px] leading-[1.2] font-black text-white text-center">
                      MINUTES
                    </p>
                    <p className="day text-[#efff00] text-[72px] md:text-[84px] leading-none font-black text-center">
                      {formatTime(countdown.minutes)}
                      {/* {formatTime(countdown.seconds)} */}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bottom-info">
                <h2 className="text-center text-white text-[24px] md:text-[28px] leading-[1.2] font-black max-w-[544px] mx-auto uppercase">
                It’s Not Over <br />’til It’s Over
                </h2>
              </div>
            </div>
          </div>
        </div> 
      </section>
    </>
  );
}
