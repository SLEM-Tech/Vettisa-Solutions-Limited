"use client";
import React, { useEffect, useRef, useState } from "react";

import Picture from "../picture/Picture";
import { useCategories, WooCommerce } from "../lib/woocommerce";
import ProductCard from "../Cards/ProductCard";
import HomeCard from "../Cards/HomeCard";
import Carousel from "../Reusables/Carousel";
import Link from "next/link";
import { convertToSlug, convertToSlug2 } from "@constants";
import { useEncryptionHelper } from "../EncryptedData";
import { useDispatch } from "react-redux";
import { updateCategorySlugId } from "../config/features/subCategoryId";
import { useRouter } from "next/navigation";
import { heroBg, heroImage, heroImage2, heroImage3 } from "@public/images";
import HeroCarousel from "../Cards/HeroCarousel";
import { FormatMoney2 } from "../Reusables/FormatMoney";
import { useCart } from "react-use-cart";
import TrustBadges from "./TrustBadges";
import BuyAccessories from "./BuyAccessories";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} className="text-orange-400 text-xs" />);
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(<FaStarHalfAlt key={i} className="text-orange-400 text-xs" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-orange-400 text-xs" />);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className="text-gray-400 text-xs">({rating})</span>
    </div>
  );
};

const AllCategorySection = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [maxScrollTotal, setMaxScrollTotal] = useState(0);
  const [scrollLeftTotal, setScrollLeftTotal] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [latestProducts, setLatestProducts] = useState<ProductType[]>([]);
  const dispatch = useDispatch();
  const router = useRouter();
  const { addItem, getItem } = useCart();

  // State to hold products by category
  const [categoryProductsMap, setCategoryProductsMap] = useState<{
    [key: string]: ProductType[];
  }>({});
  // WooCommerce API Category
  const {
    data: categories,
    isLoading: categoryWpIsLoading,
    isError: categoryIsError,
  } = useCategories("");

  const Categories: CategoryType[] = categories;
  const TotalCatgory = Categories?.length - 1;

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setIsLoading(true);

        const filteredCategories = categories
          ?.filter((category: CategoryType) => category?.count > 0)
          ?.slice(0, 5);

        if (filteredCategories) {
          const productsPromises = filteredCategories.map(
            async (category: CategoryType) => {
              const response = await WooCommerce.get(
                `products?category=${category?.id}`,
              );

              // Check if there is at least one product in the category
              const firstProductImage =
                response?.data.length > 0 ?
                  response?.data[0]?.images[0]?.src
                : null;

              return {
                categoryId: category?.id,
                firstProductImage: firstProductImage, // Store the first product's image
              };
            },
          );

          const productsResults = await Promise.all(productsPromises);

          // Update the state with the first product images mapped by category
          const productsMap = productsResults.reduce(
            (acc: any, result: any) => ({
              ...acc,
              [result.categoryId]: result.firstProductImage,
            }),
            {},
          );

          setCategoryProductsMap(productsMap);
        }
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (categories?.length) {
      fetchCategoryProducts();
    }
  }, [categories]);

  // Fetch latest products for New Arrivals
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await WooCommerce.get(
          "products?orderby=date&order=desc&per_page=8",
        );
        if (response?.data) {
          setLatestProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching latest products:", error);
      }
    };
    fetchLatestProducts();
  }, []);

  const handleNext = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      setScrollLeftTotal(scrollLeft);
      setMaxScrollTotal(maxScroll);

      sliderRef.current.scrollLeft += 600; // Adjust the scroll distance as needed
      setCurrentIndex((prevIndex) =>
        prevIndex < TotalCatgory - 1 ? prevIndex + 1 : prevIndex,
      );
    }
  };

  const handlePrev = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      setScrollLeftTotal(scrollLeft);
      setMaxScrollTotal(maxScroll);
      // console.log(scrollLeft);
      if (scrollLeft > 0) {
        sliderRef.current.scrollLeft -= 600; // Adjust the scroll distance as needed
        setCurrentIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex,
        );
      }
    }
  };

  return (
    <>
      {/* Hero Concept inspired by the image */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* The Background Image */}
        <Picture
          src={heroBg}
          alt="Brand New Collection"
          className="w-full h-full object-cover scale-105"
        />

        {/* Content Overlay — Centered */}
        <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-6 max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight tracking-tight">
            Discover Timeless <br /> Elegance with Timezone
          </h1>
          <p className="mt-6 text-sm md:text-base text-white/70 max-w-xl leading-relaxed">
            We believe that every second counts. Our carefully curated
            collection of luxury and everyday timepieces offers more than just a
            way to keep time
          </p>
          <Link
            href="/category"
            className="mt-8 inline-block bg-primary-500 hover:bg-primary-500/80 text-white text-xs md:text-sm font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded transition-colors">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Popular Products Section — Dark Theme */}
      <div className="w-full bg-[#111111] py-10 sm:py-16">
        <div className="max-w-[1256px] mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Popular Products
              </h2>
            </div>
            <Link
              href="/category"
              className="border border-gray-600 text-gray-300 text-xs sm:text-sm font-semibold uppercase tracking-wider px-5 py-2.5 rounded hover:bg-white hover:text-black transition-colors">
              View All
            </Link>
          </div>

          {/* Product Grid — 4×2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {latestProducts.length > 0 ?
              latestProducts.slice(0, 8).map((product: ProductType) => {
                const price = parseInt(product?.price || "0");
                const oldPrice =
                  product?.regular_price ?
                    parseInt(product.regular_price)
                  : null;
                const slugDesc = convertToSlug(product?.name);
                const ID = product?.id?.toString();
                const cartItem = getItem(ID);
                const rating =
                  product?.average_rating ?
                    parseFloat(product.average_rating)
                  : 4.5;

                return (
                  <div key={product.id} className="group flex flex-col">
                    {/* Image Container */}
                    <Link
                      href={`/home-item/product/${slugDesc}-${product.id}`}
                      className="relative aspect-square bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center mb-4 border border-gray-800/50 hover:border-gray-700 transition-colors">
                      <Picture
                        src={product?.images?.[0]?.src}
                        alt={product?.name}
                        className="object-contain w-[80%] h-[80%] group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Product Info */}
                    <Link
                      href={`/home-item/product/${slugDesc}-${product.id}`}
                      className="text-sm font-semibold text-white line-clamp-1 mb-1.5 hover:text-blue-400 transition-colors leading-snug"
                      dangerouslySetInnerHTML={{ __html: product?.name }}
                    />

                    {/* Star Rating */}
                    <div className="mb-2">
                      <StarRating rating={rating} />
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base sm:text-lg font-black text-blue-500">
                        {price ?
                          <FormatMoney2 value={price} />
                        : "N/A"}
                      </span>
                      {oldPrice && oldPrice > price && (
                        <span className="text-xs text-gray-500 lg:flex hidden items-center gap-1 line-through">
                          <FormatMoney2 value={oldPrice} />
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    {price > 0 && (
                      <button
                        onClick={() =>
                          addItem({
                            id: ID,
                            name: product?.name,
                            price,
                            quantity: 1,
                            image: product?.images?.[0]?.src,
                          })
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2.5 rounded transition-colors cursor-pointer">
                        {cartItem ? "Added ✓" : "Add to cart"}
                      </button>
                    )}
                  </div>
                );
              })
            : /* Loading Skeleton */
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-800 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-800 rounded w-1/2 mb-3" />
                  <div className="h-9 bg-gray-800 rounded w-full" />
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <BuyAccessories />
    </>
  );
};

export default AllCategorySection;
