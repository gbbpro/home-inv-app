// src/components/Layout.js
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-200 p-4 overflow-y-auto">{children}</main>
    </div>
  );
}
