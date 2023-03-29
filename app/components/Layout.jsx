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
      <div className="overflow-x-hidden">
        {layout?.top_announcement_bar?.announcement_enabled?.value ==
          'true' && (
          <div
            className={
              'fsb_bar text-center pt-6 pb-2  align-middle text-sm  justify-center bg-black font-extralight'
            }
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
                <button
                  type="submit"
                  className="text-white absolute inset-y-0 left-0 flex items-center"
                >
                  <IconSearch className={'w-7 h-7'} />
                </button>
                <Input
                  className={`${
                    isHome ? '' : ''
                  } block pl-8 placeholder:text-white text-base uppercase`}
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
              <Link
                to="/account"
                className="relative text-white text-base uppercase"
              >
                Login
              </Link>
            </div>
            <div className="cart-wrap relative text-white">
              <CartCount isHome={isHome} openCart={openCart} />
            </div>
          </div>
        </div>
        <div className="main-navbar">
          <nav className="flex flex-wrap justify-between items-center -mb-1">
            {/* Top level menu items */}
            {(menu?.items || []).map((item) => (
              <div className="nav-item">
                <Link
                  key={item.id}
                  to={item.to}
                  target={item.target}
                  prefetch="intent"
                  className="text-white font-semibold text-lg py-5 block nav-link"
                >
                  {item.title}
                </Link>
                <div className="mega-menu hidden absolute bg-black w-full top-full py-20 z-20">
                  <div className="mega-menu-inner">
                    <div className="sub-menu flex flex-wrap gap-5 justify-center">
                      <div className="sub-menu-item w-72 text-center">
                        <h2 className="sub-menu-title primary-color font-semibold text-lg block uppercase pb-2">
                          KOLLEKTIONEN
                        </h2>
                        <ul className="sub-menu-items flex flex-col gap-1">
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Spring / Summer 23
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Autumn / Winter 23
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Never give up!
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div className="sub-menu-item w-72 text-center">
                        <h2 className="sub-menu-title primary-color font-semibold text-lg block uppercase pb-2">
                          BEKLEIDUNG
                        </h2>
                        <ul className="sub-menu-items  flex flex-col gap-1">
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Sweatshirts
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Poloshirts
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Trainingsanzüge
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Jacken & Mäntel
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Pullover
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              T-Shirts
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Hosen & Shorts
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Hemden
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div className="sub-menu-item w-72 text-center">
                        <h2 className="sub-menu-title primary-color font-semibold text-lg block uppercase pb-2">
                          ACCESSOIRES
                        </h2>
                        <ul className="sub-menu-items flex flex-col gap-1">
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Caps & Hüte
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Mützen
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Gürtel
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Uhren
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Schmuck
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Sonnenbrillen
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              Heimtextilien
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className="text-white font-semibold text-lg block">
                              iPhone Cases
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>
          <></>
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
        <svg
          className="icon w-7 h-7 fill-white"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 22.277 28.944"
        >
          {' '}
          <defs>
            {' '}
            <clipPath id="clip-path">
              {' '}
              <rect
                id="Rectangle_7"
                data-name="Rectangle 7"
                width="22.277"
                height="28.944"
                fill="none"
                stroke="#fff"
                strokeWidth="0.5"
              />{' '}
            </clipPath>{' '}
          </defs>{' '}
          <g id="Group_5" data-name="Group 5" clipPath="url(#clip-path)">
            {' '}
            <path
              id="Path_5"
              data-name="Path 5"
              d="M20.3,26.926a.58.58,0,0,1-.471.209H2.443a.58.58,0,0,1-.469-.209.6.6,0,0,1-.161-.492L3.607,9.441a.636.636,0,0,1,.63-.571H5.852v1.351a.9.9,0,0,0,1.809,0V8.87h6.956v1.351h0a.9.9,0,1,0,1.809,0V8.87H18.04a.636.636,0,0,1,.63.571l1.8,17a.6.6,0,0,1-.161.492ZM7.661,5.286a3.478,3.478,0,1,1,6.956,0V7.061H7.661ZM20.47,9.249a2.441,2.441,0,0,0-2.43-2.187H16.426V5.287h0a5.287,5.287,0,0,0-10.573,0V7.062H4.237A2.442,2.442,0,0,0,1.808,9.249l-1.794,17a2.441,2.441,0,0,0,2.429,2.7H19.835a2.442,2.442,0,0,0,2.429-2.7l-1.795-17Z"
              transform="translate(0 0)"
              fill="#fff"
              stroke="#fff"
              strokeWidth="0.5"
              fillRule="evenodd"
            />{' '}
          </g>{' '}
        </svg>
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
      className={`bg-black site-footer px-0 py-10`}
    >
      <div className="container mx-auto">
        <div className="footer-row flex flex-wrap -mx-4">
          <div className="footer-col w-1/4 px-4">
            <div className="col-inner">
              <h4 className="title text-xl primary-color uppercase pb-10">
                QUICK LINKS
              </h4>
              <div className="nav-bar">
                <ul className="flex flex-col gap-2">
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Return Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Track Order
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Shipping
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Find a Store
                    </a>
                  </li>
                </ul>
              </div>
              <div className="social-links pt-14">
                <ul className="flex flex-wrap gap-3">
                  <li>
                    <a href="#">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      {' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={1024}
                        height={1024}
                        viewBox="0 0 1024 1024"
                      >
                        <path
                          fill="currentColor"
                          d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64zm215.3 337.7c.3 4.7.3 9.6.3 14.4c0 146.8-111.8 315.9-316.1 315.9c-63 0-121.4-18.3-170.6-49.8c9 1 17.6 1.4 26.8 1.4c52 0 99.8-17.6 137.9-47.4c-48.8-1-89.8-33-103.8-77c17.1 2.5 32.5 2.5 50.1-2a111 111 0 0 1-88.9-109v-1.4c14.7 8.3 32 13.4 50.1 14.1a111.13 111.13 0 0 1-49.5-92.4c0-20.7 5.4-39.6 15.1-56a315.28 315.28 0 0 0 229 116.1C492 353.1 548.4 292 616.2 292c32 0 60.8 13.4 81.1 35c25.1-4.7 49.1-14.1 70.5-26.7c-8.3 25.7-25.7 47.4-48.8 61.1c22.4-2.4 44-8.6 64-17.3c-15.1 22.2-34 41.9-55.7 57.6z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      {' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#currentColor"
                          d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-col w-1/4 px-4">
            <div className="col-inner">
              <h4 className="title text-xl primary-color uppercase pb-10">
                ÜBER 93.
              </h4>
              <div className="nav-bar">
                <ul className="flex flex-col gap-2">
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Terms and Conditions of Purchase
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Sustainability
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Impressum
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-col w-1/4 px-4">
            <div className="col-inner">
              <h4 className="title text-xl primary-color uppercase pb-10">
                SUPPORT
              </h4>
              <div className="nav-bar">
                <ul className="flex flex-col gap-2">
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Help
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Become an authorized Levi’s®
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Retailer
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white font-normal text-base">
                      Unsubscribe
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-col w-1/4 px-4">
            <div className="col-inner">
              <h4 className="title text-xl primary-color uppercase pb-5">
                10% OFF + FREE SHIPPING ON YOUR FIRST ORDER
              </h4>
              <h6 className="sub-title text-base text-white"></h6>
              <form action="" className='subscribe-form'>
                <label htmlFor="email" className="sr-only" > Your email </label>
                <input type="email" id="email" className="placeholder:text-white border border-white p-3 w-full bg-transparent focus:outline-none font-normal placeholder:font-normal text-white" placeholder="Email" required />
                <p className='note text-white text- py-4 font-normal'>By subscribing, I agree that the 93. AG may email me news and offers. I can <a href='#' className='underline'>unsubscribe</a> at any time. I have read the 93. <a href='#' className='underline'>Privacy Policy</a>.</p>
                <button type="submit" className="w-full text-center p-3 uppercase submit-btn text-black hover:opacity-75 transition-all font-black">SIGN UP</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* <FooterMenu menu={menu} /> */}
      {/* <CountrySelector /> */}
      {/* <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
        Licensed Open Source project.
      </div> */}
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
