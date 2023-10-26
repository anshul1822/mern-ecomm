'use server' //will work only on server

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scrapper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(productUrl : string){

    if(!productUrl) return;
    
    try {
        //scrapping and database action
        connectToDB();

        const scrappedProduct : any = await scrapeAmazonProduct(productUrl);

        // console.log('scrappedProduct', scrappedProduct);

        if(!scrappedProduct) return;

        let product = scrappedProduct;
        // console.log('product', product);
        const existingProduct = await Product.findOne({url : scrappedProduct.url});

        // console.log('existingProduct',existingProduct);

        if(existingProduct){
            const updatedPriceHistory : any = [
                ...existingProduct.priceHistory,
                { price : scrappedProduct.currentPrice}
            ];

            product = { 
                ...scrappedProduct, 
                priceHistory : updatedPriceHistory,
                lowestPrice : getLowestPrice(updatedPriceHistory),
                highestPrice : getHighestPrice(updatedPriceHistory),
                averagePrice : getAveragePrice(updatedPriceHistory)
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            {url : scrappedProduct.url } , 
            product, 
            {upsert : true, new : true}
        );

        console.log('newProduct', newProduct);


        revalidatePath(`/product/${newProduct._id}`); //otherwise you will be stuck in cache
    } catch (error : any) {
        throw new Error(`Failed to create/update product: ${error.message}`);
    }
}

export async function getProductById(productId : string){

    try {
        connectToDB();

        const product = await Product.findOne({_id : productId});
        if(!product) return null;

        return product;
    } catch (error) {
        
    }
}

export async function getAllProducts(){
    try {
        connectToDB();
        const products = await Product.find();

        return products;
    } catch (error) {
        console.log(error);
    }
}

export async function getSimilarProducts(productId : string){
    try {
        connectToDB();
        const currentProduct = await Product.findById(productId);

        if(!currentProduct) return null;

        const similarProducts = await Product.find({
            _id : { $ne: productId },
        }).limit(3);

        return similarProducts;
    } catch (error) {
        console.log(error);
    }
}