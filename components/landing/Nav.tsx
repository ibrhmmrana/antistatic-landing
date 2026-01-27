import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <nav className="relative z-20 w-full px-6 py-4 md:px-8 md:py-6 lg:px-12">
      <div className="w-full flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/antistatic logo on white.svg"
            alt="Antistatic"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Centered Navigation Links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
          <Link
            href="#"
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            Product
          </Link>
          <Link
            href="#"
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            Insights
          </Link>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-6">
          <Link
            href="#"
            className="text-sm text-black hover:text-black transition-colors px-4 py-2 border border-black rounded-full hover:border-black button-roll-text"
            data-text="Sign In"
          >
            <span>Sign In</span>
          </Link>
          <Link
            href="#"
            className="text-sm bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors button-roll-text"
            data-text="Get Started"
          >
            <span>Get Started</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

