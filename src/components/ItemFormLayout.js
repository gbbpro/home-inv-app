// src/components/ItemFormLayout.js
import Link from "next/link";

const ItemFormLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-green-600 text-white py-1 shadow-md">
        <h1 className="text-xl font-bold text-center">{title}</h1>
      </header>

      {/* Main Container */}
      <div className="container mx-auto py-2 px-4 sm:px-6 lg:px-8">
        {/* Navigation Links */}
        <div className="mb-6">
          <Link
            className="text-blue-600 hover:underline mr-4"
            href="/groceries"
          >
            {" "}
            Back to Groceries
          </Link>
          <Link className="text-blue-600 hover:underline" href="/supplies">
            Back to Supplies{" "}
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ItemFormLayout;
