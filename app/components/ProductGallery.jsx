import {ATTR_LOADING_EAGER} from '~/lib/const';
import React, {useEffect, useState} from 'react';
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Thumbs,
  Controller,
} from 'swiper';
import {Link} from '~/components';
import {MediaFile} from '@shopify/hydrogen';

import {Swiper, SwiperSlide} from 'swiper/react';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({media, className}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!media.length) {
    return null;
  }
  let thumbsParams = {
    modules: [Controller],
    slideToClickedSlide: true,
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 10,
    onSwiper: setThumbsSwiper, // Get swiper instance callback
    style: {
      width: '100px',
    },
  };

  return (
    <div
      className={` ${className}`}
    >
      <div className="slider__flex flex flex-wrap items-start">
        <div className="slider__col">
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[Navigation, Thumbs]}
            direction="vertical"
            spaceBetween={10}
            centeredSlides="false"
            centeredSlidesBounds="true"
            slidesPerView='auto'
            watchOverflow="true"
            watchSlidesVisibility="true"
            watchSlidesProgress="true"
            className="swiper-container1"
            breakpoints={{
              0: {
                direction: 'horizontal',
              },
              768: {
                direction: 'vertical',
              },
            }}
          >
            {media.map((med, i) => {
              let mediaProps = {};
              const isFirst = i === 0;
              const data = {
                ...med,
                image: {
                  // @ts-ignore
                  ...med.image,
                  altText: med.alt || 'Product image',
                },
              };

              switch (med.mediaContentType) {
                case 'IMAGE':
                  mediaProps = {
                    width: 800,
                    widths: [400, 800, 1200, 1600, 2000, 2400],
                  };
                  break;
                case 'VIDEO':
                  mediaProps = {
                    width: '100%',
                    autoPlay: true,
                    controls: false,
                    muted: true,
                    loop: true,
                    preload: 'auto',
                  };
                  break;
                case 'EXTERNAL_VIDEO':
                  mediaProps = {width: '100%'};
                  break;
                case 'MODEL_3D':
                  mediaProps = {
                    width: '100%',
                    interactionPromptThreshold: '0',
                    ar: true,
                    loading: ATTR_LOADING_EAGER,
                    disableZoom: true,
                  };
                  break;
              }

              if (i === 0 && med.mediaContentType === 'IMAGE') {
                mediaProps.loading = ATTR_LOADING_EAGER;
              }

              return (
                <SwiperSlide key={i}>
                  <div
                    // @ts-ignore
                    key={med.id || med.image.id}
                  >
                    <MediaFile
                      tabIndex="0"
                      className={`fadeIn object-contain w-full h-full`}
                      data={data}
                      sizes={
                        '(min-width: 64em) 30vw, (min-width: 48em) 25vw, 90vw'
                      }
                      // @ts-ignore
                      options={{
                        crop: 'center',
                        scale: 2,
                      }}
                      {...mediaProps}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
        <div className="slider__images">
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Thumbs]}
            thumbs={{ swiper: thumbsSwiper }}
            spaceBetween={5}
            navigation
            onSwiper={(swiper) => { }}
            onSlideChange={() => console.log('slide change')}
          >
            {media.map((med, i) => {
              let mediaProps = {};
              const data = {
                ...med,
                image: {
                  // @ts-ignore
                  ...med.image,
                  altText: med.alt || 'Product image',
                },
              };

              switch (med.mediaContentType) {
                case 'IMAGE':
                  mediaProps = {
                    width: 800,
                    widths: [400, 800, 1200, 1600, 2000, 2400],
                  };
                  break;
                case 'VIDEO':
                  mediaProps = {
                    width: '100%',
                    autoPlay: true,
                    controls: false,
                    muted: true,
                    loop: true,
                    preload: 'auto',
                  };
                  break;
                case 'EXTERNAL_VIDEO':
                  mediaProps = {width: '100%'};
                  break;
                case 'MODEL_3D':
                  mediaProps = {
                    width: '100%',
                    interactionPromptThreshold: '0',
                    ar: true,
                    loading: ATTR_LOADING_EAGER,
                    disableZoom: true,
                  };
                  break;
              }

              if (i === 0 && med.mediaContentType === 'IMAGE') {
                mediaProps.loading = ATTR_LOADING_EAGER;
              }

              return (
                <SwiperSlide key={i}>
                  <div
                    // @ts-ignore
                    key={med.id || med.image.id}
                  >
                    {/* TODO: Replace with MediaFile when it's available */}

                    <MediaFile
                      tabIndex="0"
                      className={`w-full h-auto aspect-square fadeIn object-contain`}
                      data={data}
                      sizes={
                        '(min-width: 64em) 30vw, (min-width: 48em) 25vw, 90vw'
                      }
                      // @ts-ignore
                      options={{
                        crop: 'center',
                        scale: 2,
                      }}
                      {...mediaProps}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
