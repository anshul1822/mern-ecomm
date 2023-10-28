import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { scrapeAmazonProduct } from "@/lib/scrapper";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "../../../lib/utils";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { NextResponse } from "next/server";

export const maxDuration = 9; // 5 minutes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    connectToDB();
    const products = await Product.find({});

    if (!products) throw new Error("No products found");

    //1. SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrappedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrappedProduct) throw new Error("No product found");

        const updatedPriceHistory: any = [
          ...currentProduct.priceHistory,
          { price: scrappedProduct.currentPrice },
        ];

        const product = {
          ...scrappedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate({ url: scrappedProduct.url }, product );

        //2. CHECK EACH PRODUCT STATUS AND SEND MAIL ACCORDINGLY

        const emailNotifType = getEmailNotifType(scrappedProduct, currentProduct);

        if (emailNotifType && updatedProduct.users?.length > 0) {
          const productInfo = {title: updatedProduct.title, url: updatedProduct.url };

          const emailContent = await generateEmailBody(productInfo, emailNotifType);

          const userEmails = updatedProduct.user.map((user: any) => user.email);

          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });

  } catch (error) {
    throw new Error(`Error in GET: ${error}`);
  }
}
