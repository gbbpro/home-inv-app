import { useState, useEffect } from "react";

const CategoryForm = ({ onSubmit, initialData = {}, isEdit = false }) => {
  const [formData, setFormData] = useState({
    item: initialData.item || "",
    item_variety: initialData.item_variety || "",
    qty: initialData.qty || 1,
    pack_size: initialData.pack_size || "",
    cost: initialData.cost || 0,
    date_purchased: initialData.date_purchased || "",
  });

  useEffect(() => {
    setFormData({
      item: initialData.item || "",
      item_variety: initialData.item_variety || "",
      qty: initialData.qty || 1,
      pack_size: initialData.pack_size || "",
      cost: initialData.cost || 0,
      date_purchased: initialData.date_purchased || "",
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Item Field */}
      <div className="flex flex-col space-y-1">
        <label className="text-gray-700 font-medium">Item:</label>
        <input
          type="text"
          name="item"
          value={formData.item}
          onChange={handleChange}
          className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
          required
        />
      </div>

      {/* Variety Field */}
      <div className="flex flex-col space-y-1">
        <label className="text-gray-700 font-medium">Variety:</label>
        <input
          type="text"
          name="item_variety"
          value={formData.item_variety}
          onChange={handleChange}
          className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
        />
      </div>

      {/* Quantity, Pack Size, and Cost on the same line */}
      <div className="flex space-x-4">
        <div className="flex-1 flex flex-col space-y-1">
          <label className="text-gray-700 font-medium">Quantity:</label>
          <input
            type="number"
            name="qty"
            value={formData.qty}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
            required
          />
        </div>
        <div className="flex-1 flex flex-col space-y-1">
          <label className="text-gray-700 font-medium">Pack Size:</label>
          <input
            type="text"
            name="pack_size"
            value={formData.pack_size}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
          />
        </div>
        <div className="flex-1 flex flex-col space-y-1">
          <label className="text-gray-700 font-medium">Cost:</label>
          <input
            type="number"
            name="cost"
            step="0.01"
            value={formData.cost}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
          />
        </div>
      </div>

      {/* Date Purchased */}
      <div className="flex flex-col space-y-1">
        <label className="text-gray-700 font-medium">Date Purchased:</label>
        <input
          type="date"
          name="date_purchased"
          value={formData.date_purchased}
          onChange={handleChange}
          className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {isEdit ? "Update Item" : "Add Item"}
      </button>
    </form>
  );
};

export default CategoryForm;
