import {useIsHomePath, toHTML} from '~/lib/utils';
import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconAccount,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  IconCaret,
  Section,
  CountrySelector,
  Cart,
  CartLoading,
  Link,
} from '~/components';
import {useParams, Form, Await, useMatches} from '@remix-run/react';
import {useWindowScroll} from 'react-use';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo} from 'react';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {Image} from '@shopify/hydrogen';

export function Layout({children, layout}) {

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {layout?.top_announcement_bar?.announcement_enabled?.value ==
            'true' && (
            <div
              className={'fsb_bar text-center pt-6 pb-2  align-middle text-sm  justify-center bg-black font-extralight'}
            >
              <div
                className="px-10"
                dangerouslySetInnerHTML={{
                  __html: toHTML(
                    layout?.top_announcement_bar?.announcement_text?.value,
                  ),
                }}
              ></div>
            </div>
          )}
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <Header
          title={layout?.shop.name ?? 'Hydrogen'}
          menu={layout?.headerMenu}
        />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer menu={layout?.footerMenu} />
    </>
  );
}

function Header({title, menu}) {

  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({isOpen, onClose}) {
  const [root] = useMatches();

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({isOpen, onClose, menu}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({menu, onClose}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({isActive}) =>
              isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))}
    </nav>
  );
}

function MobileHeader({title, isHome, openCart, openMenu}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-primary/80 dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconSearch />
          </button>
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
        </Form>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        <Heading className="font-bold text-center" as={isHome ? 'h1' : 'h2'}>
          {title}
        </Heading>
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        <Link
          to="/account"
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconAccount />
        </Link>
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function DesktopHeader({isHome, menu, openCart, title}) {
  const params = useParams();
  const {y} = useWindowScroll();
  return (
    <header
      role="banner"
      className={`${isHome ? 'index-header' : ''} ${
        !isHome && y > 50 && ' shadow-lightHeader'
      } site-header bg-black sticky top-0 z-10`}
    >
      <div className="container mx-auto">
        <div className="header-top flex flex-wrap justify-between items-center py-5">
          <div className="header-search-bar w-1/3">
            <Form
              method="get"
              action={params.lang ? `/${params.lang}/search` : '/search'}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <button type="submit" className="text-white absolute inset-y-0 left-0 flex items-center">
                  <IconSearch className={'w-7 h-7'} />
                </button>
                <Input
                  className={`${isHome ? '' : ''} block pl-8 placeholder:text-white text-base uppercase`}
                  type="search"
                  variant="minisearch"
                  placeholder="Search"
                  name="q"
                />
              </div>
            </Form>
          </div>
          <div className="logo-wrap w-1/3">
            <Link className="" to="/" prefetch="intent">
              <Image
                data={{
                  url: 'https://cdn.shopify.com/s/files/1/0739/7172/8705/files/logo.svg?v=1680004853',
                  width: 100,
                  height: 44,
                  altText: '93',
                }}
                className="logo-img mx-auto"
                loaderOptions={{
                  scale: 2,
                  crop: 'center',
                }}
                alt="93"
              />
            </Link>
          </div>
          <div className="header-icons flex gap-2 items-center w-1/3 justify-end">
            <div className="login-wrap">
              <Link to="/account" className="relative text-white text-base uppercase">
                Login
              </Link>
            </div>
            <div className="cart-wrap relative text-white">
              <CartCount isHome={isHome} openCart={openCart} />
            </div>
          </div>
        </div>
        <div className="main-navbar py-5">
          <nav className="flex flex-wrap justify-between items-center">
            {/* Top level menu items */}
            {(menu?.items || []).map((item) => (
              <Link
                key={item.id}
                to={item.to}
                target={item.target}
                prefetch="intent"
                className={`$({ isActive }) => (isActive ? 'active' : 'inactive') text-white  font-medium, `}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

function CartCount({isHome, openCart}) {
  const [root] = useMatches();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({openCart, dark, count}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
         <svg className='icon w-7 h-7 fill-white' xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 22.277 28.944"> <defs> <clipPath id="clip-path"> <rect id="Rectangle_7" data-name="Rectangle 7" width="22.277" height="28.944" fill="none" stroke="#fff" strokeWidth="0.5" /> </clipPath> </defs> <g id="Group_5" data-name="Group 5" clipPath="url(#clip-path)"> <path id="Path_5" data-name="Path 5" d="M20.3,26.926a.58.58,0,0,1-.471.209H2.443a.58.58,0,0,1-.469-.209.6.6,0,0,1-.161-.492L3.607,9.441a.636.636,0,0,1,.63-.571H5.852v1.351a.9.9,0,0,0,1.809,0V8.87h6.956v1.351h0a.9.9,0,1,0,1.809,0V8.87H18.04a.636.636,0,0,1,.63.571l1.8,17a.6.6,0,0,1-.161.492ZM7.661,5.286a3.478,3.478,0,1,1,6.956,0V7.061H7.661ZM20.47,9.249a2.441,2.441,0,0,0-2.43-2.187H16.426V5.287h0a5.287,5.287,0,0,0-10.573,0V7.062H4.237A2.442,2.442,0,0,0,1.808,9.249l-1.794,17a2.441,2.441,0,0,0,2.429,2.7H19.835a2.442,2.442,0,0,0,2.429-2.7l-1.795-17Z" transform="translate(0 0)" fill="#fff" stroke="#fff" strokeWidth="0.5" fillRule="evenodd" /> </g> </svg>
        <div className={`${dark ? '' : ''} absolute top-0 right-0 counter`}>
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer({menu}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`grid min-h-[25rem] items-start grid-flow-row w-full gap-6 py-8 px-6 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsCount}
        bg-primary dark:bg-contrast dark:text-primary text-contrast overflow-hidden`}
    >
      <FooterMenu menu={menu} />
      <CountrySelector />
      <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
        Licensed Open Source project.
      </div>
    </Section>
  );
}

const FooterLink = ({item}) => {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
};

function FooterMenu({menu}) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between" size="lead" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${
                      open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                    } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}
