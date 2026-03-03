"use client";
import React, { useMemo, useState, useTransition, Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "react-use-cart";
import { useAppDispatch, useAppSelector } from "../hooks";
import Drawer from "rc-drawer";
import { useCustomer } from "../lib/woocommerce";
import {
  currencyOptions,
  filterCustomersByEmail,
  headerNavLinks,
} from "@constants";
import { getFirstCharacter, signOut } from "@utils/lib";
import { LogoImage } from "@utils/function";
import Picture from "../picture/Picture";
import { APICall } from "@utils";
import { fetchExchangeRate } from "@utils/endpoints";
import { setBaseCurrency, setExchangeRate } from "../Redux/Currency";
import FormToast from "../Reusables/Toast/SigninToast";
import useToken from "../hooks/useToken";

// Headless UI Components
import { Menu, Transition } from "@headlessui/react";
import {
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiShoppingCart,
  FiBookmark,
} from "react-icons/fi";
import { SlArrowDown } from "react-icons/sl";
import WorldFlag from "react-world-flags";
const Flag = WorldFlag as React.ElementType;
import GlobalLoader from "../modal/GlobalLoader";
import MobileNav from "./MobileNav";
import ProductTable from "../Tables/ProductTable";
import CategoryPageBottomHeader from "./CategoryPageBottomHeader";
import ProductPageBottomHeader from "./ProductPageBottomHeader";
import HomePageBottomHeader from "./HomePageBottomHeader";
import { FaCartArrowDown } from "@node_modules/react-icons/fa";
import { BiUser } from "@node_modules/react-icons/bi";
import { ImSpinner2 } from "@node_modules/react-icons/im";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { email } = useToken();
  const { totalItems } = useCart();

  const { baseCurrency } = useAppSelector((state) => state.currency);
  const [isPending, startTransition] = useTransition();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: customer } = useCustomer("");
  const wc_customer_info = useMemo(
    () => filterCustomersByEmail(customer as Woo_Customer_Type[], email),
    [customer, email],
  );

  const onOpenCart = () => setIsCartOpen(true);
  const onCloseCart = () => setIsCartOpen(false);

  const handleCurrencyChange = async (code: string) => {
    const selectedObj = currencyOptions.find((c) => c.code === code);
    if (!selectedObj) return;

    try {
      const data = await APICall(fetchExchangeRate, ["NGN", code], true, true);
      if (data) {
        dispatch(setExchangeRate(data));
        dispatch(setBaseCurrency(selectedObj));
        FormToast({ message: `Switched to ${code}`, success: true });
      }
    } catch (error) {
      FormToast({ message: "Currency switch failed", success: false });
    }
  };

  const handleSearch = () => {
    if (!searchValue) return;

    startTransition(() => {
      router.push(`/search?${searchValue}`);
    });
  };

  const userDropDownLinks = [
    {
      id: 1,
      href: "/user/dashboard",
      icon: <BiUser />,
      label: "My Account",
    },
    {
      id: 2,
      href: "/user/my-orders",
      icon: <FaCartArrowDown />,
      label: "Orders",
    },
    { id: 3, onClick: onOpenCart, icon: <FiShoppingCart />, label: "Cart" },
  ];

  return (
    <>
      <header className="flex flex-col w-full bg-[#1a1a1a] z-[100] fixed top-0 shadow-lg transition-all">
        {/* Desktop Header */}
        <div className="hidden slg:flex items-center justify-between w-full py-4 max-w-[1440px] px-8 mx-auto">
          {/* Logo */}
          <LogoImage className="!w-[40px]" />

          {/* Center Nav Links */}
          <nav className="flex items-center gap-8 flex-1 justify-center">
            {headerNavLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`text-sm font-medium tracking-[0.08em] transition relative group ${
                  pathname === link.href ?
                    "text-white"
                  : "text-gray-400 hover:text-white"
                }`}>
                {link.text}
                <span
                  className={`h-[2px] inline-block bg-white absolute left-0 -bottom-1 transition-all ease duration-300 ${
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}>
                  &nbsp;
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-5">
            {/* Currency Dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              {({ open }) => (
                <>
                  <Menu.Button className="flex items-center gap-1.5 cursor-pointer outline-none focus:ring-0 text-gray-400 hover:text-white transition text-sm">
                    <Flag
                      code={baseCurrency.countryCode}
                      className="w-5 h-3.5 rounded-sm object-cover"
                    />
                    <span className="font-medium">{baseCurrency.code}</span>
                    <SlArrowDown className="text-[10px]" />
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right bg-[#2a2a2a] border border-gray-700 rounded-xl shadow-xl p-1 z-[110] outline-none">
                      {currencyOptions.map((currency) => (
                        <Menu.Item key={currency.code}>
                          {({ active }) => (
                            <button
                              onClick={() =>
                                handleCurrencyChange(currency.code)
                              }
                              className={`${active ? "bg-white/10" : ""} ${
                                baseCurrency.code === currency.code ?
                                  "text-orange-400"
                                : "text-gray-300"
                              } flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}>
                              <Flag
                                code={currency.countryCode}
                                className="w-5 h-3.5 rounded-sm object-cover"
                              />
                              <span>{currency.label}</span>
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>

            <div className="w-px h-5 bg-gray-600" />

            <button
              onClick={handleSearch}
              className="text-gray-400 hover:text-white transition cursor-pointer">
              <FiSearch className="text-lg" />
            </button>

            {/* User Dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              {({ open }) => (
                <>
                  <Menu.Button className="flex items-center cursor-pointer group outline-none focus:ring-0 text-gray-400 hover:text-white transition">
                    <FiUser className="text-lg" />
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 z-[110] outline-none">
                      <div className="px-3 py-2 mb-1 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Logged in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {wc_customer_info?.first_name}
                        </p>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        {userDropDownLinks.map((item) => (
                          <Menu.Item key={item.id}>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  if (item.onClick) {
                                    e.preventDefault();
                                    item.onClick();
                                  } else if (item.href) {
                                    router.push(item.href);
                                  }
                                }}
                                className={`${
                                  active ?
                                    "bg-gray-50 text-gray-900"
                                  : "text-gray-600"
                                } flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors`}>
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => signOut()}
                            className={`${
                              active ? "bg-red-50" : ""
                            } flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-500 font-bold transition-colors mt-1`}>
                            <FiLogOut /> Log Out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>

            {/* Cart */}
            <div className="relative cursor-pointer group" onClick={onOpenCart}>
              <FiShoppingBag className="text-lg text-gray-400 group-hover:text-white transition" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 size-4 bg-orange-500 text-white text-[9px] font-black flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Accent line */}
        <div className="hidden slg:block h-[3px] bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />

        {/* Mobile Header (Hidden on Laptop) */}
        <div className="slg:hidden flex flex-col w-full p-4 gap-3 bg-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FiMenu
                className="text-2xl text-white"
                onClick={() => setDrawerVisible(true)}
              />
              <LogoImage className="!w-[30px] brightness-200" />
            </div>
            <div onClick={onOpenCart} className="relative">
              <FiShoppingBag className="text-2xl text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 size-4 bg-blue-600 rounded-full text-[9px] flex items-center justify-center text-white">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
          <div className="relative w-full h-10">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full h-full text-sm bg-gray-100 rounded-lg px-4 border-none outline-none focus:ring-2 focus:ring-primary-100"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {isPending ?
              <ImSpinner2 className="absolute right-3 top-1/3 text-primary-100 animate-spin" />
            : <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            }
          </div>
        </div>

        {/* Conditional Bottom Headers */}
        {pathname.includes("/category") ?
          <CategoryPageBottomHeader />
        : pathname.includes("/home-item") ?
          <ProductPageBottomHeader />
        : <HomePageBottomHeader />}
      </header>

      <Drawer
        open={isCartOpen}
        onClose={onCloseCart}
        placement="right"
        width={
          typeof window !== "undefined" && window.innerWidth > 768 ?
            500
          : "100%"
        }>
        <ProductTable onClose={onCloseCart} />
      </Drawer>

      <GlobalLoader isPending={isPending} />
      <MobileNav
        closeDrawer={() => setDrawerVisible(false)}
        drawerVisible={drawerVisible}
      />
    </>
  );
};

export default Header;
