"use client";

import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useFirestore } from "reactfire";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

const SearchStudent: React.FC = () => {
  const [input, setInput] = useState("");
  const [searchByEmail, setSearchByEmail] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const router = useRouter();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSearch = async () => {
    setLoading(true);
    try {
      const usersRef = collection(firestore, "Users");
      let q;

      if (searchByEmail) {
        q = query(usersRef, where("email", "==", input));
      } else {
        q = query(usersRef, where("phone", "==", `+91${input}`));
      }

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }));

      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setSearchByEmail(emailPattern.test(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input) {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6">
      <h1 className="text-xl font-medium mb-6 text-primary-text text-center">
        Search for Student by Mobile Number or Email
      </h1>

      {/* Search Input */}
      <div className="flex justify-center items-center mb-6 space-x-4">
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown} // Listen for Enter key
          placeholder="Enter 10-digit mobile or email"
          className="w-full md:w-96 text-input-text border-muted-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary"
        />
        <Button
          onClick={handleSearch}
          disabled={
            (searchByEmail && !emailPattern.test(input)) ||
            (!searchByEmail && (input.length !== 10 || loading))
          }
          className="flex items-center px-4 py-2 text-button-text border-primary hover:bg-primary transition-colors duration-300"
        >
          {loading ? (
            "Searching..."
          ) : (
            <>
              <FaSearch className="mr-2" /> Search
            </>
          )}
        </Button>
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 gap-6">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user.userId}
              className="p-4 bg-card rounded-lg shadow-md cursor-pointer"
              onClick={() => router.push(`/user-info?userId=${user.userId}`)}
            >
              <h2 className="text-lg font-semibold text-primary-text">
                Name: {user.name}
              </h2>
              <p className="text-secondary-text">Email: {user.email}</p>
              <p className="text-secondary-text">Phone: {user.phone}</p>
              <p className="text-secondary-text">User ID: {user.userId}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-primary-text">No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchStudent;
