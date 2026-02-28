"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import {
  FiShare2,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";
import { useCart } from "react-use-cart";
import Picture from "../picture/Picture";
import SocialMediaShare from "../common/SocialMediaShare";
import { useProduct } from "../lib/woocommerce";
import RelatedProductsSection from "./RelatedProductsSection";
import { Skeleton } from "@heroui/react";
import Drawer from "rc-drawer";
import { FormatMoney2 } from "../Reusables/FormatMoney";
import Image from "next/image";
import ProductTable from "../Tables/ProductTable";

interface ProductDisplaySectionProps {
  FormatedId?: string;
}

const ProductDisplaySection = ({ FormatedId }: ProductDisplaySectionProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const { data: product, isLoading } = useProduct(FormatedId);
  const Product: ProductType = product;

  const pathname = usePathname();
  const { addItem, removeItem, updateItem, getItem } = useCart();

  const [baseUrl, setBaseUrl] = useState("");
  const [isLoadingMainImage, setIsLoadingMainImage] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const onOpenCart = () => setIsCartOpen(true);
  const onCloseCart = () => setIsCartOpen(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  // Calculate Discount
  const discount = useMemo(() => {
    if (!Product?.regular_price || !Product?.price) return 0;
    const reg = parseInt(Product.regular_price);
    const sale = parseInt(Product.price);
    if (reg <= sale) return 0;
    return Math.round(((reg - sale) / reg) * 100);
  }, [Product]);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <Skeleton className="h-6 w-1/4 rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-12 w-1/3 rounded-full" />
        </div>
      </section>
    );
  }

  if (!Product) return null;

  const ID = Product.id.toString();
  const price = parseInt(Product.price);
  const cartItem = getItem(ID);
  const qty = cartItem?.quantity || 0;

  const increase = () =>
    addItem({
      id: ID,
      name: Product.name,
      price,
      quantity: qty + 1,
      image: Product.images[0]?.src,
    });
  const decrease = () =>
    qty <= 1 ? removeItem(ID) : updateItem(ID, { quantity: qty - 1 });

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-3 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* --- LEFT: IMAGE GALLERY --- */}
          <div className="flex flex-col gap-6 w-full max-w-[600px]">
            <div className="relative aspect-square bg-[#1a1a1a] rounded-md lg:rounded-[2rem] overflow-hidden border border-gray-800 group">
              {discount > 0 && (
                <div className="absolute top-6 left-6 z-10 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg uppercase">
                  SAVE {discount}%
                </div>
              )}

              <Image
                src={Product.images[selectedImage]?.src}
                alt={Product.name}
                className={`w-full h-full object-contain p-2 lg:p-8 transition-all duration-700 ${isLoadingMainImage ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}
                width={1000}
                height={1000}
                priority
                onLoad={() => setIsLoadingMainImage(false)}
              />
            </div>

            {Product.images.length > 1 && (
              <div className="flex flex-wrap sm:flex-nowrap gap-4 overflow-x-auto no-scrollbar p-2 w-full">
                {Product.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative flex-shrink-0 size-20 rounded-2xl border-2 transition-all overflow-hidden bg-[#111111] p-1 ${
                      selectedImage === index ?
                        "border-blue-500 shadow-md scale-105"
                      : "border-gray-800 hover:border-gray-600"
                    }`}>
                    <Picture
                      src={img.src}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT: PRODUCT INFO --- */}
          <div className="flex flex-col">
            <div className="space-y-2 border-b border-gray-800 pb-6">
              <div className="flex items-center gap-2">
                <span
                  dangerouslySetInnerHTML={{
                    __html: Product.categories[0]?.name,
                  }}
                  className="text-[10px] font-black uppercase tracking-[2px] text-blue-500"
                />

                <span className="size-1 rounded-full bg-gray-700" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                {Product.name}
              </h1>

              <div className="flex gap-4 pt-2">
                <div className="flex flex-col">
                  {Product.regular_price &&
                    parseInt(Product.regular_price) > price && (
                      <span className="text-sm text-gray-500 line-through font-medium">
                        <FormatMoney2 value={parseInt(Product.regular_price)} />
                      </span>
                    )}
                  <span className="text-3xl font-black text-blue-500 tracking-tighter">
                    <FormatMoney2 value={price} />
                  </span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-[10px] h-fit font-black uppercase border ${
                    Product.stock_status === "instock" ?
                      "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}>
                  {Product.stock_status === "instock" ?
                    "Available in Stock"
                  : "Out of Stock"}
                </div>
              </div>
            </div>

            {/* Attributes Section */}
            {Product.attributes.length > 0 && (
              <div className="py-6 space-y-4 border-b border-gray-800">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                  Specifications
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {Product.attributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex flex-col p-3 bg-[#1a1a1a] rounded-xl border border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {attr.name}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {attr.options.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Area */}
            <div className="py-8 space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Quantity
                  </span>
                  <div className="flex items-center bg-[#1a1a1a] rounded-2xl p-1 border border-gray-800">
                    <button
                      onClick={decrease}
                      className="size-10 flex items-center justify-center bg-[#111111] text-white rounded-xl shadow-sm hover:text-red-500 transition-colors active:scale-90 border border-gray-800">
                      <AiOutlineMinus />
                    </button>
                    <span className="px-6 text-base font-black text-white min-w-[3rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={increase}
                      className="size-10 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-md hover:opacity-90 transition-all active:scale-90">
                      <AiOutlinePlus />
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] pt-6">
                  <button
                    onClick={onOpenCart}
                    disabled={Product.stock_status !== "instock"}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {qty > 0 ? "View in Cart" : "Add to Cart"}
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-800">
                <div className="flex flex-col items-center text-center gap-2">
                  <FiShield className="text-blue-500 text-xl" />
                  <span className="text-[9px] font-bold uppercase text-gray-500">
                    Secure Payment
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 border-x border-gray-800">
                  <FiTruck className="text-blue-500 text-xl" />
                  <span className="text-[9px] font-bold uppercase text-gray-500">
                    Fast Shipping
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specs Tab */}
        <div className="mt-2 lg:mt-20 w-[95%] overflow-x-auto">
          <div className="flex gap-8 border-b border-gray-800 mb-8">
            <button className="pb-4 border-b-2 border-white text-white text-xs lg:text-sm font-black uppercase tracking-widest">
              Description
            </button>
            <button className="pb-4 text-gray-500 text-xs lg:text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
              Reviews ({Product.rating_count})
            </button>
          </div>
          <div
            className="text-base text-gray-300 leading-relaxed max-w-4xl prose prose-invert"
            dangerouslySetInnerHTML={{ __html: Product.description }}
          />
        </div>

        <RelatedProductsSection
          productCategoryId={Product.categories[0]?.id.toString()}
        />
      </section>

      <Drawer
        open={isCartOpen}
        onClose={onCloseCart}
        placement="right"
        width={
          typeof window !== "undefined" && window.innerWidth > 768 ?
            600
          : "100%"
        }
        maskClosable={true}>
        <ProductTable onClose={onCloseCart} />
      </Drawer>
    </>
  );
};

export default ProductDisplaySection;
