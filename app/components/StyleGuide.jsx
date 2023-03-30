import React from 'react';
import { Section, Link, Heading } from '~/components';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

export function StyleGuide({ title = 'STYLE GUIDE', image_1, image_2, ...props }) {

  return (
    <div className="styleGuide-section bg-white py-6 sm:py-7 md:py-10 lg:py-14 xl:py-20">
      <div className="container mx-auto">
        <Heading
          heading={title?.value}
          {...props}
          className={
            'text-black uppercase text-center w-full sec-title text-2xl pb-6 lg:pb-9 font-black'
          }
        >
          {title?.value}
        </Heading>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          spaceBetween={20}
          slidesPerView={2}
          navigation
          breakpoints={{
            0: {
              slidesPerView: 1.3,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
          }}
        >
          <SwiperSlide>
            <div className="items h-full">
              <a href="#">
                <div className="overflow-hidden h-full">
                  <img
                    className="hover:scale-110 transition hover:duration-500 object-cover object-center h-full w-full"
                    src={image_1?.reference?.image?.url}
                  ></img>
                </div>
              </a>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="items h-full">
              <a href="#">
                <div className="overflow-hidden h-full">
                  <img
                    className="hover:scale-110 transition hover:duration-500 object-cover object-center h-full w-full"
                    src={image_2?.reference?.image?.url}
                  ></img>
                </div>
              </a>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
