import {defer} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {
  ProductSwimlane,
  FeaturedCollections,
  Hero,
  FeatureHomeProduct,
  TopSaleHomeProduct,
  FittingEveryone,
  Section,
  StyleGuide,
} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import {AnalyticsPageType} from '@shopify/hydrogen';

export async function loader({params, context}) {
  const {language, country} = context.storefront.i18n;

  if (
    params.lang &&
    params.lang.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the lang URL param is defined, yet we still are on `EN-US`
    // the the lang param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {shop, hero} = await context.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: {metaObjectId: 'gid://shopify/Metaobject/1925972289'},
  });

  const {top_sale_collection} = await context.storefront.query(
    HOMEPAGE_TOP_SALE_COLLECTION_QUERY,
    {
      variables: {collectionId: 'gid://shopify/Metaobject/1928266049'},
    },
  );

  const styleGuide = context.storefront.query(
    HOMEPAGE_STYLE_GUIDE_QUERY,
    {
      variables: {metaObjectId: 'gid://shopify/Metaobject/1932329281'},
    },
  );

  const fittingEveryOne = context.storefront.query(
    HOMEPAGE_FITTING_EVERYONE_QUERY,
    {
      variables: {metaObjectId: 'gid://shopify/Metaobject/1929085249'},
    },
  );

  const featureSaleCollectionProduct = await context.storefront.query(
    FEATURED_SALE_COLLECTIONS_QUERY,
    {
      variables: {
        ids: top_sale_collection.collection.value
          ? [top_sale_collection.collection.value]
          : [],
        country,
        language,
      },
    },
  );

  return defer({
    shop,
    primaryHero: hero,
    featureSaleCollection: {
      title: top_sale_collection.title.value,
      data: featureSaleCollectionProduct,
    },
    styleGuide,
    fittingEveryOne,
    // These different queries are separated to illustrate how 3rd party content
    // fetching can be optimized for both above and below the fold.
    featuredProducts: context.storefront.query(
      HOMEPAGE_FEATURED_PRODUCTS_QUERY,
      {
        variables: {
          /**
           * Country and language properties are automatically injected
           * into all queries. Passing them is unnecessary unless you
           * want to override them from the following default:
           */
          country,
          language,
        },
      },
    ),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export default function Homepage() {
  const {
    primaryHero,
    featuredProducts,
    fittingEveryOne,
    styleGuide,
    featureSaleCollection,
  } = useLoaderData();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  // TODO: analytics
  // useServerAnalytics({
  //   shopify: {
  //     pageType: ShopifyAnalyticsConstants.pageType.home,
  //   },
  // });

  return (
    <>
      {primaryHero && (
        <Hero {...primaryHero} height="full" top loading="eager" />
      )}

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({products}) => {
              if (!products?.nodes) return <></>;
              return (
                <FeatureHomeProduct
                  products={products.nodes}
                  title="LATEST DROPS"
                  count={3}
                />
              );
            }}
          </Await>
        </Suspense>
      )}


      {styleGuide && (
        <Suspense>
          <Await resolve={styleGuide}>
            {({data}) => {
              if (!data) return <></>;
              return (
                <StyleGuide
                  title={data.title}
                  image_1={data.image_1}
                  image_2={data.image_2}
                  count={2}
                />
              );
            }}
          </Await>
        </Suspense>
      )}
      
      {/* <Section heading={'STYLE GUIDE'} padding="y">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center">
            <div className="w-96 px-2">
              <div className="logo-wrap">
                <img
                  className="w-full"
                  src="https://cdn.shopify.com/s/files/1/0739/7172/8705/files/style_guide_one.png?v=1680017229"
                ></img>
              </div>
            </div>
            <div className="w-96 px-2">
              <div className="logo-wrap">
                <img
                  className="w-full"
                  src="https://cdn.shopify.com/s/files/1/0739/7172/8705/files/style_guide_two.png?v=1680017230"
                ></img>
              </div>
            </div>
          </div>
        </div>
      </Section> */}

      {featureSaleCollection && (
        <Suspense>
          <Await resolve={featureSaleCollection}>
            {(data) => {
              if (!data?.data?.nodes[0]?.products) return <></>;
              return (
                <TopSaleHomeProduct
                  products={data?.data?.nodes[0]?.products.nodes}
                  title_handle={data.data?.nodes[0]?.handle}
                  title={data.title}
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {fittingEveryOne && (
        <Suspense>
          <Await resolve={fittingEveryOne}>
            {(data) => {
              if (!data.data) return <></>;
              return <FittingEveryone data={data.data} />;
            }}
          </Await>
        </Suspense>
      )}
    </>
  );
}

// @see: https://shopify.dev/api/storefront/latest/queries/collections
export const FEATURED_SALE_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    nodes(ids:$ids) {
      ...on Collection {
        id
        handle
        title
        image {
          id
          src
        }
        products(first: 3, reverse : true) {
          nodes {
            id
            handle
            title
            variants (first: 1) {
              nodes {
                id,
                image {
                  id
                	url
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const HOMEPAGE_TOP_SALE_COLLECTION_QUERY = `#graphql
  query homeTopCollections($collectionId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    top_sale_collection : metaobject(id : $collectionId) {
      handle
      id
      type
      title : field(key: "title") {
        value
      }
      collection : field(key: "collection") {
        value
      }
    }
      
  }
`;

const HOMEPAGE_STYLE_GUIDE_QUERY = `#graphql
${MEDIA_FRAGMENT}
  query homeStyleGuide($metaObjectId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    data : metaobject(id : $metaObjectId) {
      handle
      id
      type
      title : field(key: "title") {
        value
      }
      image_1 : field(key: "image_1") {
        reference {
          ...Media
        }
      }
      image_2 : field(key: "image_2") {
        reference {
          ...Media
        }
      }
    }
      
  }
`;

const HOMEPAGE_FITTING_EVERYONE_QUERY = `#graphql
${MEDIA_FRAGMENT}
  query homeFittingEveryOne($metaObjectId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    data : metaobject(id : $metaObjectId) {
      handle
      id
      type
      main_title : field(key: "main_title") {
        value
      }
      description : field(key: "description") {
        value
      }
      image : field(key: "image") {
        reference {
          ...Media
        }
      }
      button_1_title : field(key: "button_1_title") {
        value
      }
      button_1_redirect : field(key: "button_1_redirect") {
        value
      }
      button_2_title : field(key: "button_2_title") {
        value
      }
      button_2_redirect : field(key: "button_2_redirect") {
        value
      }
      button_3_title : field(key: "button_3_title") {
        value
      }
      button_3_redirect : field(key: "button_3_redirect") {
        value
      }
    }
      
  }
`;

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  ${MEDIA_FRAGMENT}
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
`;

const HOMEPAGE_SEO_QUERY = `#graphql
${MEDIA_FRAGMENT}
  query collectionContent($metaObjectId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: metaobject(id: $metaObjectId) {
      handle
      title : field(key: "title") {
        value
      }
      title_redirect_link : field(key: "title_redirect_link") {
        value
      }
      banner_image : field(key: "banner_image") {
        reference {
          ...Media
        }
      }
    }
    shop {
      name
      description
    }
  }
`;

const COLLECTION_HERO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 3, reverse : true) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    nodes(ids:$ids) {
      ...on Collection {
        id
        handle
        title
        image {
          id
          src
        }
        products(first: 1) {
          nodes {
            id
            handle
            variants (first: 1) {
              nodes {
                id,
                image {
                  id
                	url
                }
              }
            }
          }
        }
      }
    }
  }
`;
