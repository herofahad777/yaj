import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yuj-green">
                <span className="text-lg font-bold text-white">Y</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Yuj</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              A centralized network for professional altruism and emergency
              mobilization. Connecting helpers with those in need.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/problems" className="hover:text-yuj-green">
                  Public Problems
                </Link>
              </li>
              <li>
                <Link to="/disasters" className="hover:text-yuj-green">
                  Disasters
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-yuj-green">
                  Volunteer
                </Link>
              </li>
              <li>
                <Link to="/professionals" className="hover:text-yuj-green">
                  Professionals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/about" className="hover:text-yuj-green">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-yuj-green">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-yuj-green">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-yuj-green">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/privacy" className="hover:text-yuj-green">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-yuj-green">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-yuj-green">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Yuj. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
