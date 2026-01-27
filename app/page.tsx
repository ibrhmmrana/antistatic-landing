import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import ProductFeatures from "@/components/landing/ProductFeatures";
import Pricing from "@/components/landing/Pricing";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Hero Section with Background */}
      <div className="relative">
        {/* Background Gradient - only for hero */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background color.svg"
            alt="Background"
            fill
            priority
            className="object-cover"
            quality={90}
          />
        </div>
        <div className="relative z-10">
          <Nav />
          <Hero />
        </div>
      </div>

      {/* Product Features Section with White Background */}
      <div className="relative z-10 bg-white">
        <ProductFeatures />
      </div>

      {/* Pricing Section */}
      <div className="relative z-10 bg-white">
        <Pricing />
      </div>

      {/* Sticky footer links - bottom left */}
      <div className="fixed bottom-4 left-4 z-20 flex flex-row gap-2">
        <Link
          href="/privacy"
          className="text-xs text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-md hover:bg-white/90 shadow-sm"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-xs text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-md hover:bg-white/90 shadow-sm"
        >
          Terms of Service
        </Link>
        <Link
          href="/data-deletion"
          className="text-xs text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-md hover:bg-white/90 shadow-sm"
        >
          Data Deletion
        </Link>
      </div>
    </main>
  );
}

