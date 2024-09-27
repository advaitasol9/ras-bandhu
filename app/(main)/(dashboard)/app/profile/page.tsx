"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFirestore, useStorage } from "reactfire";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserContext } from "@/components/context/user-provider";
import { HiMiniPencilSquare } from "react-icons/hi2";
import Loader from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

const ProfilePage: React.FC = () => {
  const { user, userData, isAdmin, isMentor } = useUserContext();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userData?.name && name != userData.name) setName(userData.name);
    if (userData?.email && email != userData.email) setEmail(userData.email);
    if (userData?.avatarUrl && avatarUrl != userData.avatarUrl)
      setAvatarUrl(userData.avatarUrl);
  }, [userData]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (loading) return;

    if (!name || !email) {
      toast({ title: "Error", description: "Name and email are required." });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast({ title: "Error", description: "Invalid email format." });
      return;
    }

    setLoading(true);
    const userDocRef = doc(firestore, "Users", user?.uid || "");

    if (selectedFile) {
      // Upload the file to Firebase Storage
      const avatarRef = ref(storage, `avatars/${user?.uid}`);
      await uploadBytes(avatarRef, selectedFile);
      const downloadURL = await getDownloadURL(avatarRef);

      // Update the avatar URL in Firestore
      await updateDoc(userDocRef, {
        name,
        email,
        avatarUrl: downloadURL,
      });

      setAvatarUrl(downloadURL);
    } else {
      // If no new file is selected, just update the name and phone number
      await updateDoc(userDocRef, {
        name,
        email,
      });
    }

    setIsEditing(false);
    setLoading(false);
    if (!isAdmin && !isMentor) router.push("/app");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
    }
  };

  useEffect(() => {
    if (userData && (!userData?.email || !userData?.name)) setIsEditing(true);
  }, [userData]);

  return (
    <div className="mx-auto mt-12 md:container md:max-w-lg">
      <h1 className="text-2xl font-semibold mb-8 text-center text-[rgb(var(--primary-text))]">
        Profile
      </h1>

      {/* Profile Section */}
      <div className="flex flex-col items-center bg-[rgb(var(--card))] p-8 rounded-lg shadow-lg">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage
              src={avatarUrl || "/avatar.png"}
              alt={name.charAt(0)}
            />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          {isEditing && (
            <>
              <label
                htmlFor="avatar-upload"
                className="absolute top-0 right-0 p-1 bg-[rgb(var(--background))] rounded-full cursor-pointer"
              >
                <HiMiniPencilSquare className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* User Details */}
        <div className="text-center space-y-4">
          <div>
            <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
              Name
            </p>
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-[rgb(var(--input))]"
              />
            ) : (
              <p className="text-lg font-semibold text-[rgb(var(--primary-text))]">
                {name}
              </p>
            )}
          </div>
          {!isEditing && (
            <div>
              <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                Phone Number
              </p>
              <p className="text-lg font-semibold text-[rgb(var(--primary-text))]">
                {userData?.phone}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
              Email
            </p>
            {isEditing ? (
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-[rgb(var(--input))]"
              />
            ) : (
              <p className="text-lg font-semibold text-[rgb(var(--primary-text))]">
                {userData?.email}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-4">
            <Loader />
          </div>
        ) : isEditing ? (
          <Button
            className="mt-6 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
            onClick={handleSaveClick}
          >
            Save
          </Button>
        ) : (
          <Button
            className="mt-6 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
            onClick={handleEditClick}
          >
            Edit Profile
          </Button>
        )}

        {isEditing && (
          <h1 className="font-medium text-sm text-[rgb(var(--edit))] mt-3">
            *Fill Profile Data
          </h1>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
