import { Facebook, Linkedin, Instagram } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-brand text-white py-8">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Company Name */}
        <div className="mb-6 md:mb-0">
          <h1 className="text-2xl font-extrabold tracking-wide uppercase">
            EMIAC Technologies
          </h1>
        </div>

        {/* Copyright Information */}
        <div className="text-center text-sm mb-6 md:mb-0">
          &copy; {new Date().getFullYear()} EMIAC Technologies. All rights reserved.
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-6">
          <a
            href="https://www.facebook.com/EMIACTech/"
            aria-label="Facebook"
            className="hover:text-gray-300 transition-colors"
            target="_blank"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="https://www.instagram.com/emiactech/?hl=en"
            aria-label="Instagram"
            className="hover:text-gray-300 transition-colors"
            target="_blank"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://www.linkedin.com/company/emiactech/"
            aria-label="LinkedIn"
            className="hover:text-gray-300 transition-colors"
            target="_blank"
          >
            <Linkedin className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
