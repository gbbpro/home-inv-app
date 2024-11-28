import { useState } from "react";
import Papa from "papaparse";

const CSVUpload = ({ apiUrl, resourceName }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(""); // Clear any previous errors
  };

  const validateData = (data) => {
    if (!data || data.length === 0) {
      setError("The CSV file is empty or invalid.");
      return false;
    }

    const requiredFields = ["item", "item_variety", "category"];

    const missingFields = requiredFields.filter(
      (field) => !Object.keys(data[0]).includes(field)
    );

    if (missingFields.length > 0) {
      setError(
        `Missing required fields: ${missingFields.join(
          ", "
        )}. Please check your CSV file.`
      );
      return false;
    }

    return true;
  };

  const normalizeData = (data) =>
    data.map((item) => ({
      ...item,
      item: item.item.toLowerCase().trim(),
      item_variety: item.item_variety.toLowerCase().trim(),
      category: item.category.toLowerCase().trim(),
    }));

  const handleUpload = () => {
    if (!file) return setError("Please select a file first!");

    setLoading(true);
    setError("");

    // Parse the CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (!validateData(results.data)) {
          setLoading(false);
          return;
        }

        // Normalize the data
        const normalizedData = normalizeData(results.data);

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: normalizedData }),
          });

          if (response.ok) {
            alert(`${resourceName} uploaded successfully!`);
          } else {
            const responseError = await response.json();
            setError(responseError.error || "Failed to upload items.");
          }
        } catch (error) {
          setError("An error occurred during the upload. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-2">{`Upload ${resourceName}`}</h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 w-full text-sm text-gray-700"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default CSVUpload;
