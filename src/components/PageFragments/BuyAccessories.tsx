import React from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Picture from "../picture/Picture";
import { getInspiredBg } from "@public/images";

const BuyAccessories = () => {
  return (
    <div className="w-full relative h-[450px] sm:h-[550px] md:h-[650px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Picture
          src={getInspiredBg}
          alt="Get inspired from our Instagram"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle overlay to ensure text readability if needed */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-20 lg:px-32">
        <div className="max-w-[400px]">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 leading-[1.2] mb-4">
            Get inspired from <br />
            our Instagram
          </h2>

          <p className="text-gray-700 text-sm sm:text-base mb-6">
            If you use the hashtag #bloomey on Instagram,{" "}
            <br className="hidden sm:block" />
            we'll spotlight you.
          </p>

          <Link href="#" className="inline-flex items-center gap-3 group">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              Check it out
            </span>
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:translate-x-1">
              <FiArrowRight className="text-sm" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyAccessories;
