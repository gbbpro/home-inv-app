// src/components/CategoryLayout.js
const CategoryLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white py-6 shadow-md">
        <h1 className="text-4xl font-bold text-center">{title}</h1>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto py-8 px-4 lg:px-10">
        <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CategoryLayout;
