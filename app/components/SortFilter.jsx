import React, {useMemo, useState} from 'react';
import {Menu} from '@headlessui/react';

import {Heading, IconFilters, IconCaret, IconXMark, Text, IconClose} from '~/components';
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from '@remix-run/react';
import {useDebounce} from 'react-use';
import {Disclosure} from '@headlessui/react';

export function SortFilter({
  filters,
  appliedFilters = [],
  appliedCustomFilters = [],
  collections = [],
  className
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <div className={`flex justify-between w-full ${className}`}>
        <FiltersDrawer
          collections={collections}
          filters={filters}
          appliedFilters={appliedFilters}
          appliedCustomFilters={appliedCustomFilters}
        />
        <SortMenu />
      </div>
    </>
  );
}

export function FiltersDrawer({
  filters = [],
  appliedFilters = [],
  appliedCustomFilters = [],
  collections = [],
}) {

  const [params] = useSearchParams();
  const location = useLocation();

  const filterMarkup = (filter, option) => {
    switch (filter.type) {
      case 'PRICE_RANGE':
        const min =
          params.has('minPrice') && !isNaN(Number(params.get('minPrice')))
            ? Number(params.get('minPrice'))
            : undefined;

        const max =
          params.has('maxPrice') && !isNaN(Number(params.get('maxPrice')))
            ? Number(params.get('maxPrice'))
            : undefined;

        return <PriceRangeFilter min={min} max={max} appliedCustomFilters={appliedCustomFilters}/>;

      default:
        const to = getFilterLink(filter, option.input, params, location, appliedCustomFilters);
        return (
          <>
          {filter.label == 'Color' ? 
          (<><Link
            className={`border-2 block hover:border-white rounded-full transition-all ${appliedCustomFilters.includes(option.label) ? 'shadow-xl shadow-gray-500 border-white' : ' border-transparent'}`}
            prefetch="intent"
            to={to}
          > 
             {filter.label == 'Color' ? (<><div className='rounded-full h-10 w-10' style={{ backgroundColor: option.label }}></div></>) : option.label}
          </Link></>) : 
          (<><><Link
            className={`border border-black hover:text-white hover:bg-black rounded-none w-10 min-w-fit h-10 flex justify-center items-center text-center text-sm p-1 text-balck font-semibold transition-all ${appliedCustomFilters.includes(option.label) ? 'text-white bg-black' : ''}`}
            prefetch="intent"
            to={to}
          > 
             {filter.label == 'Color' ? (<><div className='rounded-full h-10 w-10' style={{ backgroundColor: option.label }}></div></>) : option.label}
          </Link></></>)}
            {/* <Link
              className={`border border-black hover:text-white hover:bg-black rounded-none w-10 min-w-fit h-10 flex justify-center items-center text-center text-sm p-1 text-balck font-semibold ${appliedCustomFilters.includes(option.label) ? 'text-white bg-black' : ''}`}
              prefetch="intent"
              to={to}
            > 
               {filter.label == 'Color' ? (<><div className='rounded-full h-10 w-10' style={{ backgroundColor: option.label }}></div></>) : option.label}
            </Link> */}
          </>
        );
    }
  };
  
  // const filterHandleclick = (event) => {
  //   event.currentTarget.parentNode.classList.toggle('active');
  // };
  const [isActive, setIsActive] = useState(false);
  const filterHandleclick = event => {
    // 👇️ toggle isActive state on click
    setIsActive(current => !current);
  };

  const refs = React.useMemo(() => {
    return (
      filters.map(() => {
        return React.createRef();
      }) ?? []
    );
  }, []);

  function handleClosingOthers(id) {
    const otherRefs = refs.filter((ref) => {
      return ref.current?.getAttribute("data-id") !== id;
    });

    otherRefs.forEach((ref) => {
      const isOpen = ref.current?.getAttribute("data-open") === "true";
      if (isOpen) {
        ref.current?.click();
      }
    });
  }
  return (
    <>
      <Heading as="h4" size="lead" className='font-bold text-lg uppercase text-black lg:hidden relative flex items-center pr-5 cursor-pointer filter-toggle-btn' onClick={filterHandleclick}>
          Filter
          <IconCaret direction="down" />
      </Heading>
        <div className={`${isActive ? 'block' : 'hidden'} mobile-filter-overlay  fixed inset-0 bg-black bg-opacity-70 opacity-100 z-50`}  onClick={filterHandleclick}></div>
      <div className={`${isActive ? 'active' : ''} filter-wrap-main flex-1`}>
        <div className=''>
          <Heading as="h4" size="lead" className='font-black text-lg uppercase text-black lg:hidden relative flex items-center px-5 pt-4 pb-4 border-b border-white mb-4 justify-between filter-toggle-btn'>
              Filter
              <IconClose onClick={filterHandleclick} className={'cursor-pointer'} />
          </Heading>
        </div>
        {appliedFilters.length > 0 ? (
          <div className="pb-8 hidden">
            <AppliedFilters filters={appliedFilters} />
          </div>
        ) : null}
        <div className='flex fle-wrap px-5 lg:px-0 fillters-wrap gap-x-5 ld:gap-x-8 xl:gap-x-16'>
          {filters.map(
            (filter, idx) =>
              filter.values.length > 0 && (
                <Disclosure as="div" key={filter.id} className="filter-item pb-4 mb-4 lg:pb-0 lg:mb-0">
                  {({open}) => (
                    <>
                      <Disclosure.Button className={`${open ? 'active' : ''} flex flex-wrap items-center gap-x-1 xl:gap-x-2 btn relative lg:pb-5 pb-0`}
                         ref={refs[idx]}
                         data-id={filter.id}
                         data-open={open}
                         onClick={() => {
                            handleClosingOthers(filter.id)
                         }}
                      >
                        <Text className={'font-bold text-lg uppercase text-black'}>{filter.label}</Text>
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </Disclosure.Button>
                      <Disclosure.Panel as="div" key={filter.id} className="fillter-dropdown-wrap absolute bg-black z-10">
                        <div className='container mx-auto'>
                        <ul key={filter.id} className="pt-4 lg:py-6 flex flex-wrap gap-x-6 gap-y-3">
                          {filter.values?.map((option) => {
                            return (
                              <li key={option.id} className="">
                                {filterMarkup(filter, option)}
                              </li>
                            );
                          })}
                        </ul>
                          </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ),
          )}
        </div>
      </div>
    </>
  );
}

function AppliedFilters({filters = []}) {
  const [params] = useSearchParams();
  const location = useLocation();
  return (
    <>
      <Heading as="h4" size="lead" className="pb-4">
        Applied filters
      </Heading>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          return (
            <Link
              to={getAppliedFilterLink(filter, params, location)}
              className="flex px-2 border rounded-full gap"
              key={`${filter.label}-${filter.urlParam}`}
            >
              <span className="flex-grow">{filter.label}</span>
              <span>
                <IconXMark />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function getAppliedFilterLink(filter, params, location) {
  const paramsClone = new URLSearchParams(params);
  if (filter.urlParam.key === 'variantOption') {
    const variantOptions = paramsClone.getAll('variantOption');
    const filteredVariantOptions = variantOptions.filter(
      (options) => !options.includes(filter.urlParam.value),
    );
    paramsClone.delete(filter.urlParam.key);
    for (const filteredVariantOption of filteredVariantOptions) {
      paramsClone.append(filter.urlParam.key, filteredVariantOption);
    }
  } else {
    paramsClone.delete(filter.urlParam.key);
  }
  return `${location.pathname}?${paramsClone.toString()}`;
}

function getSortLink(sort, params, location) {
  params.set('sort', sort);
  return `${location.pathname}?${params.toString()}`;
}

function getFilterLink(filter, rawInput, params, location, appliedCustomFilters) {
  const paramsClone = new URLSearchParams(params);
  const newParams = filterInputToParams(filter.type, rawInput, paramsClone, appliedCustomFilters);
  return `${location.pathname}?${newParams.toString()}`;
}

const PRICE_RANGE_FILTER_DEBOUNCE = 500;

function PriceRangeFilter({max, min, appliedCustomFilters}) {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const navigate = useNavigate();

  const [minPrice, setMinPrice] = useState(min ? String(min) : '');
  const [maxPrice, setMaxPrice] = useState(max ? String(max) : '');

  useDebounce(
    () => {
     
      // if (
      //   (minPrice === '' || minPrice === String(min)) &&
      //   (maxPrice === '' || maxPrice === String(max))
      // )
      //   return;

      const price = {};
      if (minPrice !== '') price.min = minPrice;
      if (maxPrice !== '') price.max = maxPrice;
      const newParams = filterInputToParams('PRICE_RANGE', {price}, params, appliedCustomFilters);
      navigate(`${location.pathname}?${newParams.toString()}`);
    },
    PRICE_RANGE_FILTER_DEBOUNCE,
    [minPrice, maxPrice],
  );

  const onChangeMax = (event) => {
    const newMaxPrice = event.target.value;
    setMaxPrice(newMaxPrice);
  };

  const onChangeMin = (event) => {
    const newMinPrice = event.target.value;
    setMinPrice(newMinPrice);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <label className="">
        <span className='pr-2 text-black text-sm font-bold'>from</span>
        <input
          name="maxPrice"
          className="placeholder:text-black text-black border border-black p-3 w-full bg-transparent focus:outline-none font-normal placeholder:font-normal"
          type="text"
          defaultValue={min}
          placeholder={'$'}
          onChange={onChangeMin}
        />
      </label>
      <label>
        <span className='pr-2 text-black text-sm font-bold'>to</span>
        <input
          name="minPrice"
          className="placeholder:text-black text-black border border-black p-3 w-full bg-transparent focus:outline-none font-normal placeholder:font-normal"
          type="number"
          defaultValue={max}
          placeholder={'$'}
          onChange={onChangeMax}
        />
      </label>
    </div>
  );
}

function filterInputToParams(type, rawInput, params, appliedCustomFilters) {
  
  const input = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
  const appliedCustomFiltersArr = JSON.parse(JSON.stringify(appliedCustomFilters));
  switch (type) {
    case 'PRICE_RANGE':
      if (input.price.min) {
        params.set('minPrice', input.price.min);
      } else {
        params.delete('minPrice');
      }

      if (input.price.max) {
        params.set('maxPrice', input.price.max);
      } else {
        params.delete('maxPrice');
      }
      break;
    case 'LIST':
      Object.entries(input).forEach(([key, value]) => {
        if (typeof value === 'string') {
          params.set(key, value);
        } else if (typeof value === 'boolean') {
          params.set(key, value.toString());
        } else {
          const {name, value: val} = value;
          const allVariants = params.getAll(`variantOption`);
          const newVariant = `${name}:${val}`;
          if (!allVariants.includes(newVariant)) {
            params.append('variantOption', newVariant);
          }
          const allFilteredVariants = params.getAll(`variantOption`);
          if (appliedCustomFiltersArr.includes(val)) {
            const index = allFilteredVariants.indexOf(newVariant);
            if (index > -1) {
              allFilteredVariants.splice(index,1)
            }
          }
          params.delete('variantOption');
          allFilteredVariants.forEach((value) => {
            params.append('variantOption', value);
          });
        }
      });
      break;
  }

  return params;
}

export default function SortMenu() {
  const items = [
    {label: 'Relevance', key: ''},
    {
      label: 'Price: Low - High',
      key: 'price-low-high',
    },
    {
      label: 'Price: High - Low',
      key: 'price-high-low',
    },
    {
      label: 'Best Selling',
      key: 'best-selling',
    },
    {
      label: 'Newest',
      key: 'newest',
    },
  ];
  const [params] = useSearchParams();
  const location = useLocation();
  const activeItem = items.find((item) => item.key === params.get('sort'));

  return (
    <Menu as="div" className="relative -mt-5">
      <Menu.Button className="sortby-wrap">
        <span className="flex flex-col">
          <span className="block text-sm font-bold text-left leading-none">Sort by:</span>
          <span className='font-bold text-lg uppercase text-black flex items-center gap-1'>{(activeItem || items[0]).label}
          <IconCaret />
          </span>
        </span>
      </Menu.Button>

      <Menu.Items
        as="nav"
        className="absolute right-0 flex flex-col p-4 text-left rounded-sm bg-black w-full min-w-max z-10"
      >
        {items.map((item) => (
          <Menu.Item key={item.label}>
            {() => (
              <Link
                className={`block text-sm py-1 font-bold ${
                  activeItem?.key === item.key ? 'primary-color' : 'text-white'
                }`}
                to={getSortLink(item.key, params, location)}
              >
                {item.label}
              </Link>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
