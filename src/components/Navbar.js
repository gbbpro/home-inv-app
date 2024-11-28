import { useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import Logout from "@/components/Logout";

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSupplies, setShowSupplies] = useState(false);
  const [showGroceries, setShowGroceries] = useState(false);

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav
      className={`bg-gray-100 ${
        isCollapsed ? "w-16" : "w-64"
      } h-screen p-4 flex flex-col transition-all duration-300`}
    >
      {/* Toggle Button */}
      <div className="mb-6">
        <button
          onClick={toggleNavbar}
          className="text-gray-600 p-2 hover:bg-gray-200 rounded"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-grow space-y-4">
        <Link
          href="/shopping-list"
          className="block text-lg font-semibold text-gray-800 hover:text-gray-600"
        >
          Shopping List
        </Link>
        <Link
          href="/upload"
          className="block text-lg font-semibold text-gray-800 hover:text-gray-600"
        >
          Upload More Items
        </Link>

        {/* Supplies Dropdown */}
        <div>
          <button
            onClick={() => setShowSupplies(!showSupplies)}
            className="flex items-center justify-between w-full text-lg font-semibold text-gray-800 hover:text-gray-600"
          >
            Supplies
            {showSupplies ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {showSupplies && (
            <ul className="mt-2 space-y-2 pl-4">
              <li>
                <Link
                  href="/supplies"
                  className="text-gray-800 hover:text-gray-600"
                >
                  All Supplies
                </Link>
              </li>
              <li>
                <Link
                  href="/supplies/cleaning"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Cleaning
                </Link>
              </li>
              <li>
                <Link
                  href="/supplies/home-remedy"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Home Remedy
                </Link>
              </li>
              <li>
                <Link
                  href="/supplies/self-care"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Self Care
                </Link>
              </li>
              <li>
                <Link
                  href="/supplies/smallwares"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Smallwares
                </Link>
              </li>
              <li>
                <Link
                  href="/supplies/tools"
                  className="text-gray-800 hover:text-gray-600"
                >
                  tools
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Groceries Dropdown */}
        <div>
          <button
            onClick={() => setShowGroceries(!showGroceries)}
            className="flex items-center justify-between w-full text-lg font-semibold text-gray-800 hover:text-gray-600"
          >
            Groceries
            {showGroceries ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {showGroceries && (
            <ul className="mt-2 space-y-2 pl-4">
              <li>
                <Link
                  href="/groceries"
                  className="text-gray-800 hover:text-gray-600"
                >
                  All Groceries
                </Link>
              </li>
              <li>
                <Link
                  href="/groceries/beverage"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Beverage
                </Link>
              </li>
              <li>
                <Link
                  href="/groceries/dairy"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Dairy
                </Link>
              </li>
              <li>
                <Link
                  href="/groceries/dry-goods"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Dry-Goods
                </Link>
              </li>
              <li>
                <Link
                  href="/groceries/fruits"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Fruits
                </Link>
              </li>

              <li>
                <Link
                  href="/groceries/protein"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Protein
                </Link>
              </li>
              <li>
                <Link
                  href="/groceries/spices"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Spices
                </Link>
              </li>
              <li>
                <Link
                  href="/groceries/vegetables"
                  className="text-gray-800 hover:text-gray-600"
                >
                  Vegetables
                </Link>
              </li>
            </ul>
            
          )
          }
        </div>
        <Logout/>
      </div>

      {/* CSV Upload Section */}
    </nav>
  );
}
