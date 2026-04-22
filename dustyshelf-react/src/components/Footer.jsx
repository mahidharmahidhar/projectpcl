// src/components/Footer.jsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-gray-950 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-lg">📚</div>
              <span className="text-xl font-bold text-white">
                Dusty<span className="text-indigo-400">Shelf</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              A student-focused second-hand bookstore making education affordable. Buy and sell books at half price.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Shop", "About"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-500 hover:text-indigo-400 text-sm transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>Jayanagar, Bangalore<br />Karnataka 560041</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:hello@dustyshelf.in" className="hover:text-indigo-400 transition-colors">
                  hello@dustyshelf.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+918000000000" className="hover:text-indigo-400 transition-colors">
                  +91 80 0000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {year} DustyShelf. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            Made with ❤️ for students near Jain University, Bangalore
          </p>
        </div>
      </div>
    </footer>
  );
}
