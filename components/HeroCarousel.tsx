"use client"

import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import Image from 'next/image';
import src1 from '../public/assets/images/hero-1.svg';
import src2 from '../public/assets/images/hero-2.svg';
import src3 from '../public/assets/images/hero-3.svg';
import src4 from '../public/assets/images/hero-4.svg';
import src5 from '../public/assets/images/hero-5.svg';
import handarrow from '../public/assets/icons/hand-drawn-arrow.svg';

const heroImage = [
    {imgUrl : src1, alt: 'smartwatch'},
    {imgUrl : src2, alt: 'bag'},
    {imgUrl : src3, alt: 'lamp'},
    {imgUrl : src4, alt: 'air fryer'},
    {imgUrl : src5, alt: 'chair'}
]

const HeroCarousel = () => {
  return (
    <>
    <Carousel
    className='hero-carousel'
    showThumbs={false}
    // autoPlay
    infiniteLoop
    // interval={2000}
    showArrows={false}
    showStatus={false}>
{
    heroImage.map((image) => (
        <Image
        src={image.imgUrl}
        alt={image.alt}
        width={484}
        height={484}
        key={image.alt}
        className='object-contain'
         />
    ))
}
</Carousel>
{/* <Image 
    src={handarrow}
    alt='arrow'
    height={175}
    width={275}
    className='max-xl:hidden absolute left-[15%] bottom-0'
    /> */}
</>
  )
}

export default HeroCarousel