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
      'relative justify-end flex flex-col w-full',
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
    <div className="flex flex-col items-baseline justify-between gap-4 px-6 py-8 sm:px-8 md:px-12 bg-gradient-to-t dark:from-contrast/60 dark:text-primary from-primary/60 text-contrast">
      {title?.value && (
         <Link
         to={`${title_redirect_link.value}`}
         className="btn py-1 px-9 border-white border block focus:outline-none rounded-lg text-lg text-center"
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
