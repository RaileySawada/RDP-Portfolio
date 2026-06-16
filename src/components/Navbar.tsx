import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { profile } from "../lib/content";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-nav">
      <Link className="nav-logo" to="/" onClick={() => setMenuOpen(false)}>
        <img src={profile.logoSquareUrl} alt="" className="brand-mark" />
        <span className="brand-copy">
          {profile.shortName} <strong>Dela Peña</strong>
        </span>
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.slice(0, -1).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink className="nav-cta" to="/contact">
          Let's talk
        </NavLink>
      </nav>

      <button
        className="nav-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        {menuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>

      <div className={menuOpen ? "mobile-menu open" : "mobile-menu"}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "mobile-nav-link active" : "mobile-nav-link"
            }
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
