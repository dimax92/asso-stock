import Image from 'next/image';
import React, { FC } from 'react'

type Props = {
    src: string;
    alt: string;
    heightClass?: string;
    widthClass?: string;
}

const ProductImage: FC<Props> = ({src, alt, heightClass, widthClass}) => {

  return (
    <div className='avatar'>
        <div className={`mask mask-squircle ${heightClass} ${widthClass}`}>
            <Image 
            src={src}
            alt={alt}
            quality={100}
            className='object-cover'
            height={500}
            width={500}
            />
        </div>
    </div>
  )
}

export default ProductImage