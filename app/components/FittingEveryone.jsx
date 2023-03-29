import React from 'react'
import {toHTML} from '~/lib/utils';
import {Link} from '~/components';

export function FittingEveryone({data}) {

  return (
    <section
          className="image-with-text"
        >
          <div className="container py-4 mx-auto">
            <div className="flex flex-wrap items-center ">
              <div className='w-full md:w-2/4 overflow-hidden'>
                <img
                  alt="ecommerce"
                  className="object-cover object-center hover:scale-110 transition hover:duration-500"
                  src={data?.image?.reference?.image.url}
                />
              </div>
              <div className="w-full md:w-2/4 pt-5 md:pt-0 px-0 md:px-8 lg:px-14">
                <h1 className="text-2xl text-black pb-5 font-semibold">
                  {data?.title?.value}
                </h1>
                <div
                  className="leading-relaxed text-base mb-5 text-black"
                  dangerouslySetInnerHTML={{
                    __html: toHTML(data?.description?.value),
                  }}
                ></div>
                <div className="flex">
                  <Link
                    to={`${data?.button_1_redirect?.value}`}
                    className="btn block leading-none border text-base py-2 px-4 focus:outline-none hover:bg-transparent rounded-lg"
                  >
                    {data?.button_1_label?.value}
                  </Link>
                  <Link
                    to={`${data?.button_2_redirect?.value}`}
                    className="btn block leading-none border text-base py-2 px-4 focus:outline-none hover:bg-transparent rounded-lg"
                  >
                    {data?.button_2_label?.value}
                  </Link>
                  <Link
                    to={`${data?.button_3_redirect?.value}`}
                    className="btn block leading-none border text-base py-2 px-4 focus:outline-none hover:bg-transparent rounded-lg"
                  >
                    {data?.button_3_label?.value}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
  )
}
