"use client";

import Image from "next/image";
import BusinessSearch from "./BusinessSearch";

export default function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center">
      <div className="w-full px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Section */}
          <div className="flex flex-col space-y-6 -mt-16 md:-mt-32 lg:-mt-48">
            {/* Tagline Pill */}
            <div 
              className="inline-flex items-center justify-center w-fit px-5 py-2.5 rounded-full"
              style={{
                backgroundColor: '#F2F5FF',
                border: '1px solid #D5E2FF',
                boxShadow: 'inset 0 -2px 4px rgba(213, 226, 255, 1)'
              }}
            >
              <span className="text-sm text-gray-600 font-medium">
                Put a finger on the pulse of your digital reputation.
              </span>
            </div>

            {/* Main Headline */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold"
              style={{ 
                fontWeight: 700,
                color: '#666b82',
                lineHeight: '1.2'
              }}
            >
              Your competitor down the road is{" "}
              <span style={{ color: '#666b82' }}>4.6 stars</span>. You're{" "}
              <span style={{ color: '#666b82' }}>3.9</span>.{" "}
              <span className="font-bold" style={{ color: '#000000' }}>We fix that.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg md:text-xl text-gray-600 max-w-xl">
              Antistatic is active reputational intelligence with rapid response.
            </p>

            {/* Business Search */}
            <div className="pt-4">
              <BusinessSearch />
            </div>
          </div>

          {/* Right Section - Hero Image */}
          <div className="relative w-full flex items-center justify-center pt-4 md:pt-6 pb-16 md:pb-24 lg:pb-32">
            <div className="relative w-full max-w-full">
              <Image
                src="/images/hero image right.svg"
                alt="Coffee shop scene"
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
