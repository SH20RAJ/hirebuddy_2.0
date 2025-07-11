import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#D35C65]">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left Links */}
          <div className="space-y-4">
            <Link
              to="/community"
              className="block text-white hover:text-white/90 transition-colors"
            >
              Community
            </Link>
            <Link
              to="/blogs"
              className="block text-white hover:text-white/90 transition-colors"
            >
              Blogs
            </Link>
          </div>

          {/* Middle Links */}
          <div className="space-y-4">
            <Link
              to="/terms"
              className="block text-white hover:text-white/90 transition-colors"
            >
              Terms and Conditions
            </Link>
            <Link
              to="/privacy"
              className="block text-white hover:text-white/90 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex justify-start lg:justify-end space-x-4 items-start">
            <a
              href="https://www.linkedin.com/company/hirebuddyy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/linkedin.svg"
                alt="LinkedIn"
                className="w-8 h-8"
              />
            </a>
            <a
              href="https://www.instagram.com/hirebuddy_"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/instagram.png"
                alt="Instagram"
                className="w-8 h-8"
              />
            </a>
            <a
              href="https://x.com/hirebuddy_"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/twitter.svg"
                alt="X (formerly Twitter)"
                className="w-8 h-8"
              />
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 flex flex-col lg:flex-row justify-between items-center">
          <Link
            to="/"
            className="text-white text-2xl font-semibold mb-4 lg:mb-0"
          >
            Hirebuddy
          </Link>
          <p className="text-white">
            &copy; {new Date().getFullYear()} Hirebuddy, All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}; 