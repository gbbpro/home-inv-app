// src/pages/upload.js
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



import CSVUpload from "@/components/CSVUpload";
export default function Upload() {
  return (
    <div className="mt-auto mx-auto max-w-80 space-y-4">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-800">Supplies Upload</h3>
        <CSVUpload
          apiUrl="/api/upload/supplies"
          resourceName="Supplies"
          className="w-full p-2 bg-gray-200 rounded shadow-sm"
        />
      </div>
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-800">Groceries Upload</h3>
        <CSVUpload
          apiUrl="/api/upload/groceries"
          resourceName="Groceries"
          className="w-full p-2 bg-gray-200 rounded shadow-sm"
        />
      </div>
    </div>
  );
}
