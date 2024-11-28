import { useState } from "react";
import { useRouter } from "next/router";
import CategoryLayout from "@/components/CategoryLayout";
import ItemForm from "@/components/ItemForm";
import jwt from "jsonwebtoken";
import Cookies from "cookies";

export async function getServerSideProps(context) {
  const cookies = new Cookies(context.req, context.res);
  const token = cookies.get("token");

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    const { category } = context.params;
    const res = await fetch(
      `http://localhost:8024/api/groceries?category=${category}`
    );
    const items = await res.json();

    return {
      props: { items },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
}

export default function GroceriesCategory({ items }) {
  const [editingItem, setEditingItem] = useState(null); // Track the item being edited
  const [updatedItem, setUpdatedItem] = useState({}); // Temporary state for the edited item
  const [isAdding, setIsAdding] = useState(false); // Track add form visibility
  const router = useRouter();
  const { category } = router.query;

  const fetchGroceries = async () => {
    router.replace(router.asPath); // Refresh the page data
  };

  const toggleShoppingList = async (id, inShoppingList) => {
    await fetch(`/api/groceries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopping_list: inShoppingList ? 0 : 1 }),
    });
    fetchGroceries();
  };

  const handleDeleteItem = async (id) => {
    const confirmed = window.confirm("Do you really want to delete this item?");
    if (confirmed) {
      await fetch(`/api/groceries/${id}`, {
        method: "DELETE",
      });
      fetchGroceries();
    }
  };

  const handleUpdateItem = async () => {
    if (editingItem) {
      try {
        await fetch(`/api/groceries/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });
        setEditingItem(null);
        setUpdatedItem({});
        fetchGroceries();
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  };

  const handleAddGrocery = async (data) => {
    await fetch("/api/groceries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, category }), // Automatically set category
    });
    setIsAdding(false);
    fetchGroceries();
  };

  return (
    <CategoryLayout title={`${category?.toUpperCase() || ""} Groceries`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-h-[90vh] overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          {(category || "").toUpperCase()} Groceries
        </h1>
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-4 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add New Grocery
        </button>
        {isAdding && (
          <div className="bg-white p-4 mb-6 rounded-lg shadow">
            <ItemForm
              onSubmit={handleAddGrocery}
              initialData={{ category }} // Pre-fill category in the form
              isEdit={false}
            />
            <button
              onClick={() => setIsAdding(false)}
              className="w-full mt-4 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
        <ul>
          {items.map((item) => (
            <li key={item.id} className="border-b py-4">
              <p className="font-bold">
                {item.item.toUpperCase() || "Uncategorized"} :{" "}
                {item.item_variety}
                <br />
                {item.qty} - {item.pack_size}
              </p>
              <p>Last purchased: {item.date_purchased}</p>
              <p>${item.cost}</p>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() =>
                    toggleShoppingList(item.id, item.shopping_list)
                  }
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  {item.shopping_list
                    ? "Remove from Shopping List"
                    : "Add to Shopping List"}
                </button>
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setUpdatedItem({ ...item }); // Set initial values for edit
                  }}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>

              {/* Edit Form */}
              {editingItem && editingItem.id === item.id && (
                <div className="mt-4 bg-gray-100 p-4 rounded">
                  <h3 className="font-bold">Edit Item</h3>
                  <input
                    type="text"
                    value={updatedItem.item || ""}
                    onChange={(e) =>
                      setUpdatedItem({ ...updatedItem, item: e.target.value })
                    }
                    className="block w-full mt-2 p-2 border rounded"
                    placeholder="Item name"
                  />
                  <input
                    type="text"
                    value={updatedItem.item_variety || ""}
                    onChange={(e) =>
                      setUpdatedItem({
                        ...updatedItem,
                        item_variety: e.target.value,
                      })
                    }
                    className="block w-full mt-2 p-2 border rounded"
                    placeholder="Item Variety"
                  />
                  <input
                    type="number"
                    value={updatedItem.qty || ""}
                    onChange={(e) =>
                      setUpdatedItem({ ...updatedItem, qty: e.target.value })
                    }
                    className="block w-full mt-2 p-2 border rounded"
                    placeholder="Quantity"
                  />
                  <input
                    type="text"
                    value={updatedItem.pack_size || ""}
                    onChange={(e) =>
                      setUpdatedItem({
                        ...updatedItem,
                        pack_size: e.target.value,
                      })
                    }
                    className="block w-full mt-2 p-2 border rounded"
                    placeholder="Pack Size"
                  />
                  <input
                    type="text"
                    value={updatedItem.cost || ""}
                    onChange={(e) =>
                      setUpdatedItem({ ...updatedItem, cost: e.target.value })
                    }
                    className="block w-full mt-2 p-2 border rounded"
                    placeholder="Item Cost"
                  />
                  <input
                    type="text"
                    value={updatedItem.category || ""}
                    onChange={(e) =>
                      setUpdatedItem({
                        ...updatedItem,
                        category: e.target.value,
                      })
                    }
                    className="block w-full mt-2 p-2 border rounded"
                    placeholder="Item Category"
                  />
                  <button
                    onClick={handleUpdateItem}
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="mt-2 ml-2 bg-gray-300 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </CategoryLayout>
  );
}


