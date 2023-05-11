import {useRef, useMemo, useState, useEffect} from 'react';

import {Disclosure, Listbox} from '@headlessui/react';
import {defer} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Await,
  useSearchParams,
  useLocation,
  useTransition,
  useMatches
} from '@remix-run/react';
import {
  AnalyticsPageType,
  Money,
  ShopPayButton,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  Heading,
  IconHeart,
  IconCaret,
  IconCheck,
  IconClose,
  ProductGallery,
  ProductSwimlane,
  Section,
  Skeleton,
  Text,
  Link,
  AddToCartButton,
  ProductRecommnded
} from '~/components';
import {getExcerpt, addFavouriteProduct, removeFavouriteProduct} from '~/lib/utils';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

const seo = ({data}) => {
  const media = flattenConnection(data.product.media).find(
    (media) => media.mediaContentType === 'IMAGE',
  );

  return {
    title: data?.product?.seo?.title ?? data?.product?.title,
    media: media?.image,
    description: data?.product?.seo?.description ?? data?.product?.description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: data?.product?.vendor,
      name: data?.product?.title,
    },
  };
};

export const handle = {
  seo,
};

export async function loader({params, request, context}) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const {shop, product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  //const recommended = getRecommendedProducts(context.storefront, product.id);

  
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  };

  return defer({
    product,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
  });
}

export default function Product() {
  const {product} = useLoaderData();
  const [root] = useMatches();

  const collectionProducts = product?.collections?.nodes[0]?.products?.nodes?.filter((prod) => prod.id != product.id);
  const recommendedProducts = collectionProducts?.slice(0, 3);

  const {media, title, descriptionHtml} = product;

  return (
    <>
       <Section className="px-0 py-4 product-main">
       <div className="container mx-auto overflow-x-hidden">
            {/* Breadcrumb */}
            <div className="Breadcrumb mb-4" aria-label="Breadcrumb">
              <ol className="flex flex-wrap gap-1 items-center text-black text-xs font-semibold">
                <li> <a href="#">Men</a> </li>
                <li> <span>/</span> </li>
                <li> <a href="#">Clothing</a> </li>
                <li> <span>/</span> </li>
                <li> <span>Clothing</span> </li>
              </ol>
            </div>
            <div className="flex flex-wrap gap-y-3 pb-[40px]">
                <Heading as="h1" className="lg:hidden whitespace-normal text-lg text-black font-black">
                      {title}
                  </Heading>
                <ProductGallery
                  media={media.nodes}
                  className="w-full lg:w-3/5 product-gallery-wrap"
                />
                <div className="w-full lg:w-2/5 product-info-wrap relative pt-4 lg:pt-0">
                    <Heading as="h1" className="hidden lg:block whitespace-normal text-lg text-black font-black mb-5">
                      {title}
                    </Heading>
                    <ProductForm />
                    <div className="description-wrap mt-7">
                      {descriptionHtml && (
                        <div
                          className="text-base font-normal"
                          dangerouslySetInnerHTML={{__html: descriptionHtml}}
                        />
                      )}
                    </div>
                </div>
            </div>
        </div>
      </Section>
      <ProductRecommnded title="RECOMMENDED FOR YOU" title_handle={`collections/${product?.collections?.nodes[0]?.handle}`} products={recommendedProducts} />
    </>
  );
}

export function ProductForm() {
  const {product, analytics} = useLoaderData();

  const [currentSearchParams] = useSearchParams();
  const transition = useTransition();



  // Add to Favourite
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const localUserWishList = localStorage.getItem('user_wishlist') ? JSON.parse(localStorage.getItem('user_wishlist')) : [];
      if (isAdded) {
          if (!localUserWishList.includes(product.id)) {
              setIsAdded(false);
          }
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isAdded]);

  useEffect(() => {
    setIsAdded(false);
    if (localStorage.getItem('user_wishlist')) {
      const wishlist = JSON.parse(localStorage.getItem('user_wishlist'));
      if (wishlist.includes(product.id)) {
        setIsAdded(true);
      }
    }
  }, [product.handle]);

  const handleAddWishlist = () => {
    addFavouriteProduct(product.id);
    setIsAdded(true);
  };

  const handleRemoveWishlist = () => {
    removeFavouriteProduct(product.id);
    setIsAdded(false);
  };

  /**
   * We update `searchParams` with in-flight request data from `transition` (if available)
   * to create an optimistic UI, e.g. check the product option before the
   * request has completed.
   */
  const searchParams = useMemo(() => {
    return transition.location
      ? new URLSearchParams(transition.location.search)
      : currentSearchParams;
  }, [currentSearchParams, transition]);

  const firstVariant = product.variants.nodes[0];

  /**
   * We're making an explicit choice here to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first. Developers are welcome to opt-out of this behavior.
   * By default, the first variant's options are used.
   */
  const searchParamsWithDefaults = useMemo(() => {
    const clonedParams = new URLSearchParams(searchParams);

    for (const {name, value} of firstVariant.selectedOptions) {
      if (!searchParams.has(name)) {
        clonedParams.set(name, value);
      }
    }

    return clonedParams;
  }, [searchParams, firstVariant.selectedOptions]);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant ?? firstVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics = {
    ...analytics.products[0],
    quantity: 1,
  };

  return (
    <div className="variant-btn-wrap">
      <div className="grid gap-4">
        <ProductOptions
          options={product.options}
          searchParamsWithDefaults={searchParamsWithDefaults}
        />
        {selectedVariant && (
         <>
           <div className="flex gap-1">
            <Text className="max-w-prose whitespace-pre-wrap text-copy flex gap-3 text-lg font-bold text-black">
            <Money
              withoutTrailingZeros
              data={selectedVariant?.price}
              className={`${isOnSale ? 'sale-price' : ''}`}
            />
            {isOnSale && (
              <Money
                withoutTrailingZeros
                data={selectedVariant?.compareAtPrice}
                as="span"
                className="strike text-black line-through font-medium"
              />
            )}
          </Text>
        </div>
          <div className="grid items-stretch gap-4">
            <AddToCartButton
              lines={[
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                },
              ]}
              variant={isOutOfStock ? 'secondary' : 'primary'}
              data-test="add-to-cart"
              className='btn add-to-cart-btn bg-black text-white font-semibold text-lg w-full mx-auto py-1 md:py-2 px-5 hover:opacity-75 transition-all uppercase'
              analytics={{
                products: [productAnalytics],
                totalValue: parseFloat(productAnalytics.price),
              }}
            >
              {isOutOfStock ? (
                <Text>Sold out</Text>
              ) : (
                <Text
                  as="span"
                  className="flex items-center justify-center gap-2"
                >
                  <span>ADD TO BAG</span>
                </Text>
              )}
            </AddToCartButton>
              <button onClick={ isAdded ?  handleRemoveWishlist : handleAddWishlist } className="btn Wishlist-btn primary-bg-color text-black font-semibold text-lg w-full mx-auto py-1 md:py-2 px-5 hover:opacity-75 transition-all flex justify-center items-center border-b-2 border-black uppercase gap-2" >
                <IconHeart fill= {isAdded ? '#000' : 'none'}/>FAVOURITE
             </button>
          </div>
         </>
        )}
      </div>
    </div>
  );
}

function ProductOptions({options, searchParamsWithDefaults}) {
  const closeRef = useRef(null);
  
  return (
    <>
      {options
        .filter((option) => option.values.length > 1)
        .map((option) => (
          <div
            key={option.name.toString()}
            className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
          >
            <Heading as="h4" className="text-base text-black font-bold mb-2">
              {option.name}
            </Heading>
            <div className="flex flex-wrap gap-x-4 gap-y-3">
              <>
                  {option.values.map((value) => {
                    const checked =
                      searchParamsWithDefaults.get(option.name) === value;
                    const id = `option-${option.name}-${value}`;

                    return (
                      <span key={id.toString()}>
                        {
                          option.name == 'Color' ? (
                            <>
                              <ProductOptionLink
                                
                                optionName={option.name}
                                optionValue={value}
                                searchParams={searchParamsWithDefaults}
                                className={clsx(
                                  'border-4 block rounded-full transition-all outline-2 outline',
                                  checked ? 'outline-primary border-transparent' : 'border-gray-100 outline-transparent',
                                )}
                              >
                                <div className='rounded-full h-8 w-8' style={{ backgroundColor: value }}></div>
                                <span className='sr-only'>{value}</span>
                              </ProductOptionLink>
                            </>
                          ) : ( <Text>
                            <ProductOptionLink
                              optionName={option.name}
                              optionValue={value}
                              searchParams={searchParamsWithDefaults}
                              className={clsx(
                                'border border-black hover:text-white hover:bg-black rounded-none w-fit min-w-[40px] h-[40px] flex justify-center items-center text-center text-sm p-1 text-balck font-semibold transition-all',
                                checked ? 'text-white bg-black' : '',
                              )}
                            />
                          </Text>)
                        }
                      </span>
                    );
                  })}
                </>
            </div>
          </div>
        ))}
    </>
  );
}

function ProductOptionLink({
  optionName,
  optionValue,
  searchParams,
  children,
  ...props
}) {
  const {pathname} = useLocation();
  const isLangPathname = /\/[a-zA-Z]{2}-[a-zA-Z]{2}\//g.test(pathname);
  // fixes internalized pathname
  const path = isLangPathname
    ? `/${pathname.split('/').slice(2).join('/')}`
    : pathname;

  const clonedSearchParams = new URLSearchParams(searchParams);
  clonedSearchParams.set(optionName, optionValue);

  return (
    <Link
      {...props}
      preventScrollReset
      prefetch="intent"
      replace
      to={`${path}?${clonedSearchParams.toString()}`}
    >
      {children ?? optionValue}
    </Link>
  );
}

function ProductDetail({title, content, learnMore}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-primary/30 text-primary/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      options {
        name
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariantFragment
      }
      media(first: 7) {
        nodes {
          ...Media
        }
      }
      variants(first: 1) {
        nodes {
          ...ProductVariantFragment
        }
      }
      collections(first : 1) {
        nodes {
          handle
          products(first: 4) {
            nodes {
              ...ProductCard
            }
          }
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

async function getRecommendedProducts(storefront, productId) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 3},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = products.recommended
    .concat(products?.additional?.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}
