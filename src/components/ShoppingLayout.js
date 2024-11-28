// src/components/ShoppingListLayout.js
import Link from "next/link";

const ShoppingListLayout = ({ title = "Shopping List", children }) => {
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-600 text-white py-4 shadow-md">
        <h1 className="text-3xl font-bold text-center">{title}</h1>
      </header>

      <div className="container mx-auto p-4 flex flex-col md:flex-row md:space-x-6">
        {/* Sidebar Navigation */}
        
        {/* Main Content Area */}
        <main className="w-full md:w-3/4 bg-white p-6 text-gray-800 rounded-lg shadow-md">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ShoppingListLayout;
