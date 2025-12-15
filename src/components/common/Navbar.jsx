import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";

import logo from "../../assets/Logo/studyplanetLogo.png";
import { NavbarLinks } from "../../data/navbar-links";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";
import { ACCOUNT_TYPE } from "../../utils/constants";
import ProfileDropdown from "../core/Auth/ProfileDropDown";
import ProgressBar from "./progressbar";

function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);

  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const closeTimeoutRef = useRef(null);

  /* ---------- HELPERS ---------- */

  const slugify = (name) =>
    name
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const matchRoute = (route) => {
    if (route.includes("/:")) {
      const prefix = route.split("/:")[0];
      return location.pathname.startsWith(prefix);
    }
    return location.pathname === route;
  };

  /* ---------- EFFECTS ---------- */

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        setSubLinks(res.data.data);
      } catch (error) {
        console.log("Could not fetch categories", error);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  /* ---------- DROPDOWN HANDLERS ---------- */

  const handleMouseEnter = () => {
    if (isDesktop) {
      clearTimeout(closeTimeoutRef.current);
      setDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (isDesktop) {
      closeTimeoutRef.current = setTimeout(() => {
        setDropdownOpen(false);
      }, 150);
    }
  };

  /* ---------- RENDER ---------- */

  return (
    <div className="sticky top-0 z-[1000]">
      <div className="bg-black border-b border-b-richblack-800">
        <div className="mx-auto flex max-w-maxContent flex-col md:flex-row items-center justify-between px-4 py-2">
          {/* ---------- LOGO ---------- */}
          <div className="flex w-full md:w-auto items-center justify-between">
            <Link to="/">
              <img src={logo} alt="Logo" width={170} loading="lazy" />
            </Link>

            <button
              className="md:hidden text-2xl text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? "✖" : <AiOutlineMenu />}
            </button>
          </div>

          {/* ---------- NAV LINKS ---------- */}
          <nav className={`${mobileMenuOpen ? "block" : "hidden"} md:block`}>
            <ul className="flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0">
              {NavbarLinks.map(({ title, path }, index) => (
                <li
                  key={index}
                  onMouseEnter={
                    title === "Catalog" ? handleMouseEnter : undefined
                  }
                  onMouseLeave={
                    title === "Catalog" ? handleMouseLeave : undefined
                  }
                  className="relative"
                >
                  {title === "Catalog" ? (
                    <div
                      className="flex cursor-pointer items-center gap-1 text-richblack-25 hover:text-yellow-25"
                      onClick={() =>
                        !isDesktop && setDropdownOpen(!dropdownOpen)
                      }
                    >
                      <span>{title}</span>
                      <BsChevronDown />

                      {dropdownOpen && (
                        <div
                          className="absolute left-1/2 top-full z-50 mt-2 w-[220px]
                          -translate-x-1/2 rounded-lg bg-richblack-5 p-3 text-richblack-900"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          {loading ? (
                            <p className="text-center">Loading...</p>
                          ) : subLinks?.length ? (
                            subLinks
                              .filter((c) => c?.courses?.length > 0)
                              .map((sub, i) => (
                                <Link
                                  key={i}
                                  to={`/catalog/${slugify(sub.name)}`}
                                  className="block rounded-md px-4 py-2 hover:bg-richblack-200"
                                  onClick={() => {
                                    setDropdownOpen(false);
                                    setMobileMenuOpen(false);
                                  }}
                                >
                                  {sub.name}
                                </Link>
                              ))
                          ) : (
                            <p className="text-center">No Courses</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link to={path}>
                      <span
                        className={`${
                          matchRoute(path)
                            ? "text-yellow-25"
                            : "text-richblack-25"
                        } hover:text-yellow-25`}
                      >
                        {title}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------- RIGHT SECTION ---------- */}
          <div
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } md:block mt-4 md:mt-0`}
          >
            <div className="flex items-center gap-6">
              {user && user.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <Link to="/dashboard/cart" className="relative">
                  <AiOutlineShoppingCart className="text-2xl text-white" />
                  {totalItems > 0 && (
                    <span className="absolute -right-2 -bottom-2 h-5 w-5 rounded-full bg-yellow-400 text-xs flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {!token && (
                <>
                  <Link to="/login">
                    <button className="rounded-md bg-yellow-50 px-4 py-2">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="rounded-md bg-blue-500 px-4 py-2 text-white">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}

              {token && <ProfileDropdown />}
            </div>
          </div>
        </div>
      </div>

      <ProgressBar />
    </div>
  );
}

export default Navbar;
