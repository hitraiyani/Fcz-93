import clsx from 'clsx';
import {MediaFile} from '@shopify/hydrogen';
import {Heading, Text, Link} from '~/components';

/**
 * Hero component that renders metafields attached to collection resources
 **/
export function Hero({
  title,
  banner_image,
  title_redirect_link,
  height,
  loading,
  top,
}) {
  return (
    <section
      className={clsx(
        'relative justify-end flex flex-col w-full hero-banner',
        top && '-mt-nav',
        height === 'full'
          ? 'h-screen'
          : 'aspect-[4/5] sm:aspect-square md:aspect-[5/4] lg:aspect-[3/2] xl:aspect-[2/1]',
      )}
    >
      <div className="absolute inset-0 grid flex-grow grid-flow-col pointer-events-none auto-cols-fr -z-10 content-stretch overflow-clip">
        {banner_image?.reference && (
          <div>
            <SpreadMedia
              scale={2}
              sizes={'(min-width: 80em) 1400px, (min-width: 48em) 900px, 500px'}
              widths={[500, 900, 1400]}
              width={750}
              data={banner_image.reference}
              loading={loading}
            />
          </div>
        )}
      </div>
      <div className="absolute btn-warp bottom-9 left-0 right-0 w-full flex justify-center">
        {title?.value && (
          <Link
            to={`${title_redirect_link.value}`}
            className="btn bg-black text-white font-semibold text-lg max-w-fit mx-auto py-1 md:py-2 px-5 hover:opacity-75 transition-all"
          >
            {title.value}
          </Link>
        )}
      </div>
    </section>
  );
}

function SpreadMedia({data, loading, scale, sizes, width, widths}) {
  return (
    <MediaFile
      data={data}
      className="block object-cover w-full h-full"
      mediaOptions={{
        video: {
          controls: false,
          muted: true,
          loop: true,
          playsInline: true,
          autoPlay: true,
          width: (scale ?? 1) * width,
          previewImageOptions: {scale, src: data.previewImage?.url ?? ''},
        },
        image: {
          loading,
          loaderOptions: {scale, crop: 'center'},
          widths,
          sizes,
          width,
          alt: data.alt || '',
        },
      }}
    />
  );
}
