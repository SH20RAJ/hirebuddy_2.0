import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Link } from "react-router-dom";

export default function Community() {
  return (
    <div className="min-h-screen bg-[#fff7f8]">
      <Header />
      <div className="flex flex-col items-center justify-center p-4 pt-20">
        {/* Badge */}
      <div className="inline-flex items-center rounded-full border border-[#ffe0e0] bg-[#ffe0e0] px-4 py-1.5 mb-8">
        <span className="text-sm font-medium text-[#b16368]">Already 10000+ Members & Growing</span>
      </div>

      {/* Main Content */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-mabry font-semibold text-[#403334] max-w-4xl mb-6">
        Join India's Most Powerful <span className="text-[#b24e55]">Job-Seeker Community</span>
      </h1>

      <p className="text-lg md:text-xl text-center text-[#4A3D55] max-w-2xl mb-12">
        We're building India's largest job-hunting crew — where students and fresh grads find jobs faster through insider leads, referrals, and zero-stress support.
        <br /><br />
        No spam. No ghosting. Just real opportunities, real people, and a community that's got your back.
      </p>

      {/* Join Button */}
      <a href="https://chat.whatsapp.com/K8L5tBu7wB1BYbAAIhEQ1Z" target="_blank" rel="noopener noreferrer">
        <Button className="h-14 px-8 text-lg font-normal rounded-xl bg-gradient-to-t from-[#b24e55] to-[#E3405F] hover:opacity-90 text-white">
          Join the Community 🚀
          <svg
            className="ml-2"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </a>

        {/* Blog Link */}
        <div className="mt-12 text-center">
          <p className="text-[#4A3D55] mb-4">Want to learn more about job hunting?</p>
          <Link to="/blogs" className="text-[#b24e55] hover:text-[#E75A82] font-medium">
            Check out our Blog →
          </Link>
        </div>
      </div>
    </div>
  );
} 