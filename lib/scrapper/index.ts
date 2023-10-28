import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice, extractRating } from "../utils";

export async function scrapeAmazonProduct(url : string){

    if(!url) return;

    //BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);

    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth : {
            username : `${username}-session-${session_id}`,
            password
        },
        host : 'brd.superproxy.io',
        port,
        rejectUnauthorized : false
    }

    try {
        //Fetch the product page

        const response = await axios.get(url, options);
        // console.log('response', response.data);

        const $ = cheerio.load(response.data);

        //Extract the product title
        const title = $('#productTitle').text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price')
        );

        const originalPrice = extractPrice(
            $('.a-price .reinventPricePriceToPayMargin span.a-offscreen'),
            $('#priceblock_ourprice'),
            $('.a-price .a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            // $('.a-size-base .a-color-price')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = 
        $('#imgBlkFront').attr('data-a-dynamic-image') || 
        $('#landingImage').attr('data-a-dynamic-image') || '{}';

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

        const stars = extractRating($('.AverageCustomerReviews .a-col-right .a-color-base'));
        console.log('stars', stars);
        const reviewsCount = $('.averageStarRatingNumerical').text().replace(/[^0-9]/g, "");

        const description = extractDescription($);

        //Construct data object with scrapped information

        const data = {
            url, 
            currency: currency || '₹',
            image : imageUrls[0],
            title,
            currentPrice : Number(currentPrice) || Number(originalPrice),
            originalPrice : Number(originalPrice) || Number(currentPrice),
            priceHistory : [],
            discountRate : Number(discountRate),
            stars : Number(stars),
            reviewsCount : Number(reviewsCount),
            isOutOfStock : outOfStock,
            category: currency,
            description,
            lowestPrice : Number(currentPrice) || Number(originalPrice),
            highestPrice : Number(originalPrice) || Number(currentPrice),
            averagePrice : Number(currentPrice) || Number(originalPrice)

        }
        
        return data;

    } catch (error : any) {
        throw new Error(`Failed to scrape Product: ${error.message}`);
    }
}