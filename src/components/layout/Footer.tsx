
import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[rgba(97,83,189,1)] text-white">
      <div className="container mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-[50px]"
                alt="HelloWorld! Logo"
              />
              <div className="font-black text-2xl">HelloWorld!</div>
            </div>
            <p className="text-sm">The world in one place</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:underline">About us</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="/press" className="hover:underline">Press</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/blog" className="hover:underline">Blog</Link></li>
              <li><Link to="/support" className="hover:underline">Support</Link></li>
              <li><Link to="/safety" className="hover:underline">Safety Center</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:underline">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} HelloWorld!. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
