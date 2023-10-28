import { getProductById, getSimilarProducts } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import heart from "../../../public/assets/icons/red-heart.svg";
import share from "../../../public/assets/icons/share.svg";
import star from "../../../public/assets/icons/star.svg";
import priceTag from "../../../public/assets/icons/price-tag.svg";
import chart from "../../../public/assets/icons/chart.svg";
import arrowUp from "../../../public/assets/icons/arrow-up.svg";
import arrowDown from "../../../public/assets/icons/arrow-down.svg";
import bag from "../../../public/assets/icons/bag.svg";
import { Product } from "@/types";
import { formatNumber } from "@/lib/utils";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import Modal from "@/components/Modal";

type Props = {
  params: { id: string };
};

const ProductDetail = async ({ params: { id } }: Props) => {
  const product: Product = await getProductById(id);
  
  if (!product) redirect("/");

  const similarProducts = await getSimilarProducts(id);

  return (
    <>
      <div className="product-container">
        <div className="flex gap-28 xl:flex-row flex-col">
          <div>
            <Image
              src={product.image}
              alt={product.title}
              width={580}
              height={400}
              className="mx-auto"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
              <div className="flex flex-col gap-3">
                <p className="text-[28px] text-secondary font-semibold">
                  {product.title}
                </p>
                <Link
                  href={product.url}
                  target="_blank"
                  className="text-base text-black opacity-50"
                >
                  Go To Product
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <div className="product-hearts">
                  <Image src={heart} alt="heart" width={20} height={20} />
                  <p className="text-base font-semibold text-[#D46F77]">
                    {product.reviewsCount}
                  </p>
                </div>

                <div className="p-2 bg-white rounded-10">
                  <Image src={share} alt="heart" width={20} height={20} />
                </div>
              </div>
            </div>

            <div className="product-info">
              <div className="flex flex-col gap-2">
                <p className="text-[34px] text-secondary font-bold">
                  {product.currency} {formatNumber(product.currentPrice)}
                </p>
                <p className="text-[21px] text-secondary opacity-50 line-through">
                  {product.currency} {formatNumber(product.originalPrice)}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="product-stars">
                    <Image src={star} alt="star" width={16} height={16} />
                    <p className="text-sm text-primary-orange font-semibold">
                      {product.stars}
                    </p>
                  </div>
                </div>
              </div>
              {/* Price Cards */}
              <div className="my-7 flex flex-col gap-5">
                <div className="flex gap-5 flex-wrap">
                  <PriceInfoCard
                    title="Current Price"
                    iconSrc={priceTag}
                    value={`${product.currency} ${formatNumber(
                      product.currentPrice
                    )}`}
                    borderColor="#b6dbff"
                  />
                  <PriceInfoCard
                    title="Average Price"
                    iconSrc={chart}
                    value={`${product.currency} ${formatNumber(
                      product.averagePrice
                    )}`}
                    borderColor="#b6dbff"
                  />
                  <PriceInfoCard
                    title="Highest Price"
                    iconSrc={arrowUp}
                    value={`${product.currency} ${formatNumber(
                      product.highestPrice
                    )}`}
                    borderColor="#b6dbff"
                  />
                  <PriceInfoCard
                    title="Lowest Price"
                    iconSrc={arrowDown}
                    value={`${product.currency} ${formatNumber(
                      product.lowestPrice
                    )}`}
                    borderColor="#BEFFC5"
                  />
                </div>
              </div>
              <Modal productId={id}/>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-16">
          <div>
            <h3 className="text-2xl my-2 text-secondary font-semibold">
              Product Description
            </h3>

            <div className="flex flex-col gap-4">
              {product?.description?.split("\n")}
            </div>
          </div>

          <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
            <Image src={bag} alt="check" width={22} height={22} />
            <Link href="/" className="text-base text-white">
              Buy Now
            </Link>
          </button>
        </div>

        {similarProducts?.length && (
          <div className="py-14 flex flex-col gap-2 w-full">
            <p className="section-text">Similar Products</p>

            <div className="flex flex-wrap gap-10 mt-7 w-full">
              {similarProducts?.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
