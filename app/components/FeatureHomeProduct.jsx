import React from 'react'
import {ProductCard, Section, Link} from '~/components';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

const mockProducts = new Array(12).fill('');

export function FeatureHomeProduct({
  title = 'Featured Products',
  products = mockProducts,
  ...props
}) {

  return (
      <div >
        <Section heading={title} padding="y" {...props}>
        </Section>
      <Swiper
              modules={[Navigation,Pagination, Scrollbar, A11y]}
              spaceBetween={1}
              slidesPerView={5}
              navigation
          >
        {products.map((product, index) => (
            <SwiperSlide key={index}>
                <div className="flex flex-wrap justify-center">
                    <div  key={product.id}>
                        <Link
                            to={`${product.id ? '/products/' + product.handle : product.handle}`}
                            key={product.id}
                            className="px-5 py-3 hover:bg-white/40 h-full flex items-center justify-center relative"
                        >
                            <div className="flex flex-col justify-center items-center">
                                <div className="overflow-hidden">
                                    <img className='block m-auto object-contain w-56 rounded-xl hover:scale-110 transition hover:duration-500' src={product?.variants?.nodes[0]?.image?.url}></img>
                                </div>
                                <p className='text-sm text-black font-normal text-center leading-tight tracking-normal pt-4'>{product.title}</p>
                            </div>
                        </Link>
                    </div>                 
                </div>
            </SwiperSlide>
        ))}
        </Swiper>
      </div>
    
  );
}

