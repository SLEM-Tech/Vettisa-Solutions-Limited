"use client";
import { convertToSlug } from "@constants";
import Picture from "@src/components/picture/Picture";
import { FormatMoney2 } from "@src/components/Reusables/FormatMoney";
import { useCategories, WooCommerce } from "@src/components/lib/woocommerce";
import GlobalLoader from "@src/components/modal/GlobalLoader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { useCart } from "react-use-cart";
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

export const Loader = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse flex flex-col">
        <div className="aspect-square bg-gray-800 rounded-lg mb-4" />
        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-3" />
        <div className="h-9 bg-gray-800 rounded w-full" />
      </div>
    ))}
  </div>
);

const SortedProducts = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saleProducts, setSaleProducts] = useState<ProductType[]>([]);
  const [popularProducts, setPopularProducts] = useState<ProductType[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { addItem, getItem } = useCart();

  // Fetch sale products (on_sale) and popular products (by popularity)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const [saleRes, popularRes] = await Promise.all([
          WooCommerce.get(
            "products?on_sale=true&per_page=6&orderby=date&order=desc",
          ),
          WooCommerce.get("products?orderby=popularity&per_page=8&order=desc"),
        ]);
        if (saleRes?.data) setSaleProducts(saleRes.data);
        if (popularRes?.data) setPopularProducts(popularRes.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      {/* ─── Popular Products Section ─── */}
      <div className="w-full bg-[#111111] py-10 sm:py-16">
        <div className="max-w-[1256px] mx-auto px-4">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <p className="text-sm text-blue-500 font-medium mb-1">
              Check out popular products
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Popular Products
            </h2>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {isLoading ?
              <Loader />
            : popularProducts.slice(0, 4).map((product: ProductType) => {
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
                      {/* AVAILABLE Badge */}
                      {product?.stock_status === "instock" && (
                        <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded z-10">
                          Available
                        </span>
                      )}
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
                      dangerouslySetInnerHTML={{
                        __html: product?.name,
                      }}
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
            }
          </div>
        </div>
      </div>

      {/* ─── Sale Section — Theme Updates ─── */}
      <div className="w-full bg-[#111111] py-10 sm:py-16">
        <div className="max-w-[1256px] mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ?
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-10 bg-gray-800 rounded-t-lg" />
                  <div className="aspect-square bg-gray-800/50 rounded-b-lg" />
                </div>
              ))
            : saleProducts.slice(0, 3).map((product: ProductType) => {
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
                  <div
                    key={product.id}
                    className="group flex flex-col bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800/50 hover:border-gray-700 transition-colors">
                    {/* Dark Header with Price */}
                    <div className="bg-[#111111] px-4 py-3 border-b border-gray-800/50 flex items-center justify-center">
                      <span className="text-blue-500 font-black text-lg sm:text-xl tracking-wide">
                        {price ?
                          <>
                            <FormatMoney2 value={price} /> ONLY!
                          </>
                        : "SALE!"}
                      </span>
                    </div>

                    {/* Image */}
                    <Link
                      href={`/home-item/product/${slugDesc}-${product.id}`}
                      className="relative aspect-square bg-[#1a1a1a] flex items-center justify-center">
                      {/* SALE Badge */}
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded z-10">
                        Sale
                      </span>
                      <Picture
                        src={product?.images?.[0]?.src}
                        alt={product?.name}
                        className="object-contain w-[80%] h-[80%] group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Product Name */}
                    <div className="p-4 flex flex-col gap-3">
                      <Link
                        href={`/home-item/product/${slugDesc}-${product.id}`}
                        className="text-sm font-semibold text-white line-clamp-2 hover:text-blue-400 transition-colors leading-snug"
                        dangerouslySetInnerHTML={{
                          __html: product?.name,
                        }}
                      />

                      {/* Star Rating & Price Wrapper */}
                      <div className="flex flex-col gap-1">
                        <StarRating rating={rating} />
                        {oldPrice && oldPrice > price && (
                          <span className="text-xs text-gray-500 lg:flex hidden items-center gap-1 line-through">
                            <FormatMoney2 value={oldPrice} />
                          </span>
                        )}
                      </div>

                      {/* Add to Cart */}
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
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>

      <GlobalLoader isPending={isPending} />
    </>
  );
};

export default SortedProducts;
