import React from 'react'
import {ProductCard, Section, Link, Heading} from '~/components';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

const mockProducts = new Array(12).fill('');

export function FeatureHomeProduct({
  title = 'Featured Products',
  products = mockProducts,
  ...props
}) {

  return (
    <div className='featureHomeProduct-section bg-black py-6 sm:py-7 md:py-10 lg:py-14 xl:py-20'>
      <div className='container mx-auto'>
        <Heading heading={title} {...props} className={'text-white text-center w-full sec-title text-2xl pb-6 lg:pb-9 font-black uppercase'}>
        {title}
        </Heading>
      <Swiper
              modules={[Navigation,Pagination, Scrollbar, A11y]}
              spaceBetween={25}
              slidesPerView={3}
              navigation
              breakpoints={{
                // when window width is >= 640px
                0: {
                  slidesPerView: 1.3,
                  spaceBetween: 10
                },
                640: {
                  slidesPerView: 2.3,
                  spaceBetween: 10
                },
                768: {
                  slidesPerView: 2.2,
                  spaceBetween: 10
                },
                // when window width is >= 768px
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 25
                },
              }}
          >
        {products.map((product, index) => (
            <SwiperSlide key={index}>
                <div className="prodcut-items">
                    <div className='prodcut-item'  key={product.id}>
                        <Link
                            to={`${product.id ? '/products/' + product.handle : product.handle}`}
                            key={product.id}
                            className=""
                        >
                            <div className="flex flex-col gap-3 w-full">
                                <div className="card-image aspect-[2/2] overflow-hidden bg-white">
                                    <img className='hover:scale-110 transition hover:duration-500 object-cover object-center h-full w-full' src={product?.variants?.nodes[0]?.image?.url}></img>
                                </div>
                                <p className='text-white text-lg lg:text-xl text-left primary-color font-semibold'>{product.title}</p>
                            </div>
                        </Link>
                    </div>                 
                </div>
            </SwiperSlide>
        ))}
        </Swiper>
      </div>
      </div>
  );
}

