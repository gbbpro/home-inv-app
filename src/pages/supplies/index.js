//src/pages/index.js

import { useState, useEffect } from "react";
import ItemForm from "@/components/ItemForm";
import ItemFormLayout from "@/components/ItemFormLayout";
import jwt from "jsonwebtoken";
import Cookies from "cookies";

export async function getServerSideProps(context) {
  const cookies = new Cookies(context.req, context.res);
  const token = cookies.get("token");

  // Redirect to login if token is missing or invalid
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Verify the JWT token
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return { props: {} }; // If valid, render the blog page
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
}

const SuppliesPage = () => {
  const [supplies, setSupplies] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    const res = await fetch("/api/supplies");
    const data = await res.json();
    setSupplies(data);
  };

  const handleAddSupply = async (data) => {
    await fetch("/api/supplies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    setIsAdding(false);
    fetchSupplies();
  };

  const handleDeleteItem = async (id) => {
    const confirmed = window.confirm("Do you really want to delete this item?");
    if (confirmed) {
      await fetch(`/api/supplies/${id}`, {
        method: "DELETE",
      });
      fetchSupplies();
    }
  };

  const handleUpdateItem = async (updatedData) => {
    if (editingItem) {
      try {
        const response = await fetch(`/api/supplies/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        const result = await response.json();
        console.log("Update response:", result);

        setEditingItem(null);
        fetchSupplies();
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setIsAdding(false);
  };

  // Toggle shopping list status
  const toggleShoppingList = async (id, inShoppingList) => {
    await fetch(`/api/supplies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopping_list: inShoppingList ? 0 : 1 }),
    });
    fetchSupplies();
  };

  return (
    <div className="container mx-auto max-w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Supplies List Section */}
        <div className="w-full md:w-1/2 bg-white p-4 border rounded-lg shadow-md mb-6 md:mb-0 max-h-[90vh] overflow-y-auto">
          <h1 className="text-2xl md:text-3xl text-black font-bold mb-4 text-center">
            Supplies List
          </h1>
          <ul className="space-y-3">
            {supplies.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100"
              >
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {(item.category?.toUpperCase() ?? "UNCATEGORIZED")} - {item.item.toUpperCase()} - {item.item_variety}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    Quantity: {item.qty} - {item.pack_size}
                  </p>
                  <p className="text-sm text-gray-700">
                    Last Purchased: {item.date_purchased} - ${item.cost}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-2 h-10 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="px-3 py-2 h-10 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() =>
                      toggleShoppingList(item.id, item.shopping_list)
                    }
                    className={`px-3 py-2 h-10 text-sm font-semibold rounded-md ${
                      item.shopping_list
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                    }`}
                  >
                    {item.shopping_list
                      ? "Remove from Shopping List"
                      : "Add to Shopping List"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Forms Section */}
        <div className="w-full md:w-1/2 bg-gray-100 p-4 border rounded-lg shadow-md">
          {!isAdding && !editingItem && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 px-4 mb-4 text-white bg-green-500 rounded-md hover:bg-green-600"
            >
              Add New Supply
            </button>
          )}

          {/* Item Form for Adding or Editing */}
          {(isAdding || editingItem) && (
            <div className="bg-white p-4 rounded-lg shadow">
              <ItemFormLayout
                title={isAdding ? "Add Supply Item" : "Edit Supply Item"}
              >
                <ItemForm
                  onSubmit={isAdding ? handleAddSupply : handleUpdateItem}
                  initialData={editingItem || {}}
                  isEdit={!!editingItem}
                />
                <button
                  onClick={cancelEdit}
                  className="w-full py-3 px-4 mt-4 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </ItemFormLayout>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuppliesPage;
