import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-yellow-400 rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-sm">K</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
            <p className="text-gray-400 text-sm">@Lorem</p>
          </div>

          {/* About us */}
          <div>
            <h3 className="text-white font-semibold mb-4">About us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">Zeux</Link></li>
              <li><Link href="#" className="hover:text-white">Portfolio</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
              <li><Link href="#" className="hover:text-white">Contact us</Link></li>
            </ul>
          </div>

          {/* Contact us */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact us</h3>
            <p className="text-gray-400 text-sm mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
            <p className="text-gray-400 text-sm">+908 89097 890</p>
          </div>

          {/* Socials (aligned to bottom right in grid usually, but here just in the flow) */}
          <div className="flex items-end justify-end md:col-start-4">
            <div className="flex gap-4">
              <Link href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200">
                <Facebook size={16} />
              </Link>
              <Link href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200">
                <Instagram size={16} />
              </Link>
              <Link href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200">
                <Twitter size={16} />
              </Link>
              <Link href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200">
                <Linkedin size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-center items-center text-xs text-gray-600">
          <p>Copyright ® 2025 Ranking Challenge All rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
