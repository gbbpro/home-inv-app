// src/pages/index.js
import NavigationButtons from "@/components/LinkButtons";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get JWT token from localStorage

    // If no token, redirect to login page
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]); // Dependency array to avoid infinite loops

  return (
    <div className="p-4">
     
    </div>
  );
}
