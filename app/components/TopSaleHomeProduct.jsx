import { Section, Link, Text, CompareAtPrice } from '~/components';
import { Image, Money } from '@shopify/hydrogen';
import { isDiscounted } from '~/lib/utils';

export function TopSaleHomeProduct({
    products,
    title = "SALE. SALE. SALE.",
    title_handle = '',
    className = '',
    ...props
}) {
    const haveProducts = products && products.length > 0;
    if (!haveProducts) return null;

    //const items = products.filter((item) => item.image).length;

    return (
        <Section {...props} className={`${className} featured-collection-section pt-8`}>
            <div className="container mx-auto">
                <div className="heading-wrapper--featured-collection mb-10">
                    <h2 className="main-title text-2xl font-semibold text-center mb-5">
                        {title}
                    </h2>
                    <div className="heading-divider border-b-2 border-black w-16 block m-auto"></div>
                </div>
                <div className="flex justify-center flex-wrap pro-items">
                    {products.map((product) => {
                        if (product) {
                            const inDisc = isDiscounted(
                                product?.variants.nodes[0].price,
                                product?.variants.nodes[0].compareAtPrice
                            );
                            return (
                                <div key={product.id} className="pro-item text-center w-2/4 lg:w-1/5 px-2">
                                    <Link
                                        className="block pb-3 relative"
                                        to={`/products/${product.handle}`}>
                                        <div className="card-image aspect-[2/2] rounded-xl">
                                            {inDisc && (
                                                <Text
                                                    as="label"
                                                    size="fine"
                                                    className="sale-sticker absolute top-1 left-1 px-2 py-1 z-10 sticker-text text-xs text-black tracking-normal font-normal">
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
                                                        crop: "center",
                                                    }}
                                                    className="object-contain"
                                                />
                                            )}
                                        </div>
                                    </Link>
                                    <Link className="" to={`/products/${product.handle}`}>
                                        <h2 className="pro-title text-base">
                                            {product.title}
                                        </h2>
                                    </Link>
                                    <div className="flex justify-center price">
                                        <Text className="flex gap-1 text-sm">
                                            <Money
                                                className={`${inDisc ? "sale-price" : ""
                                                    }`}
                                                withoutTrailingZeros
                                                data={product?.variants.nodes[0].price}
                                            />
                                            {inDisc && (
                                                <CompareAtPrice
                                                    className={"text-gray-400 line-through"}
                                                    data={
                                                        product?.variants.nodes[0].compareAtPrice
                                                    }
                                                />
                                            )}
                                        </Text>
                                    </div>
                                </div>
                            );
                        }
                    })}
                    <div className="pro-item text-center w-2/4 lg:w-1/5 px-2">
                        <Link
                            className="block pb-3 relative"
                            to={`/collections/${title_handle}`}>
                            <div className="card-image aspect-[2/2] rounded-xl font-extrabold">
                                EXPORE EVERYTHING
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </Section>
    );
}
