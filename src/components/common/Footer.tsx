import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sewa-green">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Sewa</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              A centralized network for professional altruism and emergency mobilization.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Platform
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/problems" className="hover:text-sewa-green">
                  Problems Feed
                </Link>
              </li>
              <li>
                <Link to="/disasters" className="hover:text-sewa-green">
                  Live Disasters
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-sewa-green">
                  Volunteer
                </Link>
              </li>
              <li>
                <Link to="/professionals" className="hover:text-sewa-green">
                  For Professionals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Support
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/about" className="hover:text-sewa-green">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-sewa-green">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sewa-green">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-sewa-green">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Legal
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/privacy" className="hover:text-sewa-green">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-sewa-green">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-sewa-green">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Sewa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
