import {json} from '@shopify/remix-oxygen';
import {flattenConnection} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {useFetcher} from '@remix-run/react';

/**
 * Fetch a given set of products from the storefront API
 * @param count
 * @param query
 * @param reverse
 * @param sortKey
 * @returns Product[]
 * @see https://shopify.dev/api/storefront/2023-01/queries/products
 */
export async function loader({request, context: {storefront}}) {
 
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const productsIds =  searchParams.get('products') ?  JSON.parse(searchParams.get('products')) : [];

  const products = await storefront.query(USER_WHISHLIST_PRODUCT_QUERY, {
    variables: {
      ids : [...new Set(productsIds)],
      language : storefront.i18n.language,
    },
  })

  invariant(products, 'No data returned from top products query');

  return json({
    products: flattenConnection(products),
  });
}

export const USER_WHISHLIST_PRODUCT_QUERY = `#graphql
  query homepageMegaMenuProducts($ids: [ID!]!, $language: LanguageCode)
  @inContext( language: $language) {
    nodes(ids:$ids) {
      ...on Product {
        id
        title
        handle
        variants(first: 1) {
          nodes {
            id
            availableForSale
            image {
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
          }
        }
      }
    }
  }
`;

const PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query (
    $query: String
    $count: Int
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
  ) @inContext(country: $country, language: $language) {
    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// no-op
export default function UserWishListProductsApiRoute() {
  return null;
}
