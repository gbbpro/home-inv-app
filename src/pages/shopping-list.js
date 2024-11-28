import ShoppingListLayout from "@/components/ShoppingLayout";
import { useEffect, useState } from "react";
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

const ShoppingList = () => {
  const [groceries, setGroceries] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState({
    groceries: [],
    supplies: [],
  });

  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const fetchShoppingLists = () => {
    fetch("/api/groceries/shopping-list")
      .then((res) => res.json())
      .then((data) => setGroceries(data));

    fetch("/api/supplies/shopping-list")
      .then((res) => res.json())
      .then((data) => setSupplies(data));
  };

  // Toggle strikethrough for purchased items
  const togglePurchased = (id, type) => {
    if (type === "grocery") {
      setPurchasedItems((prev) => ({
        ...prev,
        groceries: prev.groceries.includes(id)
          ? prev.groceries.filter((itemId) => itemId !== id)
          : [...prev.groceries, id],
      }));
    } else {
      setPurchasedItems((prev) => ({
        ...prev,
        supplies: prev.supplies.includes(id)
          ? prev.supplies.filter((itemId) => itemId !== id)
          : [...prev.supplies, id],
      }));
    }
  };

  // Move purchased items to completed purchases
  const moveToCompleted = async () => {
    const confirmed = window.confirm(
      "Do you want to submit the Completed Grocery List?"
    );
    if (confirmed) {
      const completedData = {
        groceries: groceries.filter((item) =>
          purchasedItems.groceries.includes(item.id)
        ),
        supplies: supplies.filter((item) =>
          purchasedItems.supplies.includes(item.id)
        ),
      };

      try {
        const completedResponse = await fetch("/api/completed-purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(completedData),
        });
        const completedResult = await completedResponse.json();
        console.log("Completed purchases response:", completedResult);

        const updateResponse = await fetch("/api/update-date-purchased", {
          method: "POST",
        });
        const updateResult = await updateResponse.json();
        console.log("Update date purchased response:", updateResult);
      } catch (error) {
        console.error("Error in moving items to completed purchases:", error);
      }
    }
    clearShoppingList(); // Clear list after moving to completed
  };

  // Clear all items from the shopping list
  const clearShoppingList = async () => {
    const confirmed = window.confirm("Do you want to clear the Shopping List");
    if (confirmed) {
      await fetch("/api/clear-shopping-list", {
        method: "POST",
      });
      fetchShoppingLists();
      setPurchasedItems({ groceries: [], supplies: [] }); // Reset purchased items
    }
  };

  return (
    <ShoppingListLayout title="Shopping List">
      {/* Control Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={moveToCompleted}
          className="bg-blue-800 text-sm text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Complete Shopping List
        </button>
        <button
          onClick={clearShoppingList}
          className="bg-red-800 text-sm text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Shopping List
        </button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-h-[90vh] overflow-y-auto">
        <h1>Shopping List</h1>

        {/* Groceries Section */}
        <h2 className="font-extrabold text-3xl max-w-md bg-gray-800 text-white">
          Groceries
        </h2>
        {groceries.length === 0 ? (
          <p>No groceries in the shopping list yet.</p>
        ) : (
          <ul>
            {groceries.map((item) => (
              <li
                key={`grocery-${item.id}`}
                className="flex justify-between items-center"
              >
                <div
                  className={`flex-1 ${
                    purchasedItems.groceries.includes(item.id)
                      ? "line-through"
                      : ""
                  }`}
                >
                  <p className="text-lg font-extrabold text-gray-800">
                    {item.category
                      ? item.category.toUpperCase()
                      : "Uncategorized"}{" "}
                    &nbsp; &nbsp;
                    {item.item.toUpperCase()} - {item.item_variety}
                  </p>
                  <p className="text-sm text-gray-700">
                    Quantity: {item.qty} - {item.pack_size}
                  </p>
                  <p className="text-sm text-gray-700">
                    Last Purchased {item.date_purchased}
                  </p>
                </div>
                <button
                  onClick={() => togglePurchased(item.id, "grocery")}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  {purchasedItems.groceries.includes(item.id)
                    ? "Undo"
                    : "Purchased"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Supplies Section */}
        <h2 className="font-extrabold text-3xl max-w-md bg-gray-800 text-white">
          Supplies
        </h2>
        {supplies.length === 0 ? (
          <p>No supplies in the shopping list yet.</p>
        ) : (
          <ul>
            {supplies.map((item) => (
              <li
                key={`supply-${item.id}`}
                className="flex justify-between items-center"
              >
                <div
                  className={`flex-1 ${
                    purchasedItems.supplies.includes(item.id)
                      ? "line-through"
                      : ""
                  }`}
                >
                  <p className="text-lg font-extrabold text-gray-800">
                    {item.category
                      ? item.category.toUpperCase()
                      : "Uncategorized"}{" "}
                    &nbsp; &nbsp;
                    {item.item.toUpperCase()} - {item.item_variety}
                  </p>
                  <p className="text-sm text-gray-700">
                    Quantity: {item.qty} - {item.pack_size}
                  </p>
                  <p className="text-sm text-gray-700">
                    Last Purchased {item.date_purchased}
                  </p>
                </div>
                <button
                  onClick={() => togglePurchased(item.id, "supply")}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  {purchasedItems.supplies.includes(item.id)
                    ? "Undo"
                    : "Purchased"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ShoppingListLayout>
  );
};

export default ShoppingList;
