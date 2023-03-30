import React from 'react'
import {toHTML} from '~/lib/utils';
import {Link} from '~/components';

export function FittingEveryone({data}) {

  return (
    <section
          className="image-with-text py-10 md:py-14 bg-white"
        >
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-y-5">
              <div className='w-full md:w-2/4 overflow-hidden'>
                <img
                  alt="ecommerce"
                  className="object-cover object-center hover:scale-110 transition hover:duration-500 w-full"
                  src={data?.image?.reference?.image.url}
                />
              </div>
              <div className="w-full md:w-2/4 pl-0 md:pl-5">
                <h1 className="text-4xl lg:text-5xl text-black pb-2 md:pb-9 font-black uppercase">
                  {data?.title?.value}
                </h1>
                <div
                  className="text-sm md:text-xl text-black font-medium pb-5 md:pb-9"
                  dangerouslySetInnerHTML={{
                    __html: toHTML(data?.description?.value),
                  }}
                ></div>
                <div className="flex-col md:flex-row flex gap-x-5 gap-y-3">
                  <Link
                    to={`${data?.button_1_redirect?.value}`}
                    className="btn bg-black text-white font-semibold text-lg w-full py-1 md:py-2 px-5 hover:opacity-75 transition-all text-center"
                  >
                    {data?.button_1_label?.value}
                  </Link>
                  <Link
                    to={`${data?.button_2_redirect?.value}`}
                    className="btn bg-black text-white font-semibold text-lg w-full py-1 md:py-2 px-5 hover:opacity-75 transition-all text-center"
                  >
                    {data?.button_2_label?.value}
                  </Link>
                  <Link
                    to={`${data?.button_3_redirect?.value}`}
                    className="btn bg-black text-white font-semibold text-lg w-full py-1 md:py-2 px-5 hover:opacity-75 transition-all text-center"
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
