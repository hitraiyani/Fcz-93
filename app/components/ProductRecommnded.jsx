import {Section, Link, Text, CompareAtPrice, Heading} from '~/components';
import {Image, Money} from '@shopify/hydrogen';
import {isDiscounted} from '~/lib/utils';

export function ProductRecommnded({
  products,
  title = 'RECOMMENDED FOR YOU',
  title_handle = '',
  className = '',
  ...props
}) {
  const haveProducts = products && products.length > 0;
  
  if (!haveProducts) return null;

  //const items = products.filter((item) => item.image).length;

  return (
    <Section {...props} className={`${className} TopSaleHomeProduct  py-10`}>
      <div className="container mx-auto">
        <Heading
          heading={title}
          {...props}
          className={
            'text-black text-center w-full text-4xl lg:text-5xl pb-6 lg:pb-9 font-black uppercase italic'
          }
        >
          {title}
        </Heading>
        <div className="flex justify-center flex-wrap pro-items -mx-2 gap-y-8">
          {products.map((product) => {
            if (product) {
              const inDisc = isDiscounted(
                product?.variants.nodes[0].price, 
                product?.variants.nodes[0].compareAtPrice,
              );
              return (
                <div
                  key={product.id}
                  className="pro-item w-2/4 xl:w-1/4 px-2"
                >
                  <Link
                    className="block relative"
                    to={`/products/${product.handle}`}
                  >
                    <div className="card-image aspect-[2/2] bg-white border-2 border-black">
                      {inDisc && (
                        <Text
                          as="label"
                          size="fine"
                          className="sale-sticker absolute top-1 left-1 px-2 py-1 sticker-text text-xs text-white bg-black tracking-normal font-light"
                        >
                          Setpreis
                        </Text>
                      )}
                      {product?.variants.nodes[0].image && (
                        <Image
                          alt={`Image of ${product.title}`}
                          data={product?.variants.nodes[0].image}
                          height={400}
                          sizes="(max-width: 32em) 100vw, 33vw"
                          width={600}
                          widths={[400, 500, 600, 700, 800, 900]}
                          loaderOptions={{
                            scale: 2,
                            crop: 'center',
                          }}
                          className="hover:scale-110 transition hover:duration-500 object-cover object-center h-full w-full"
                        />
                      )}
                    </div>
                  </Link>
                  <Link className="block mt-2" to={`/products/${product.handle}`}>
                    <h2 className="pro-title text-xs sm:text-lg font-black text-black">{product.title}</h2>
                  </Link>
                  <div className="flex price">
                    <Text className="flex gap-3 text-xs sm:text-lg font-semibold">
                      <Money
                        className={`${inDisc ? 'sale-price' : ''}`}
                        withoutTrailingZeros
                        data={product?.variants.nodes[0].price}
                      />
                      {inDisc && (
                        <CompareAtPrice
                          className={'text-black line-through font-normal'}
                          data={product?.variants.nodes[0].compareAtPrice}
                        />
                      )}
                    </Text>
                  </div>
                </div>
              );
            }
          })}
          {title_handle && (
            <div className="pro-item-last w-2/4 xl:w-1/4 px-2">
              <Link
                className="flex pb-3 relative border-4 border-black p-3 items-end aspect-square"
                to={`/collections/${title_handle}`}
              >
                <div className="font-black text-lg md:text-4xl text-black italic leading-none">
                  EXPORE <br/>EVERYTHING <span className='text-black block font-medium text-2xl sm:text-4xl md:text-5xl'>>>>>>>>>>>>>></span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
