"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserSession } from "../../custom-hooks/useUserSession";
import { supabase } from "../../lib/SupabaseClient";
import DeleteAccountModal from "./DeleteAccountModal";

export default function LogoutButton() {
  const { session } = useUserSession();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const LogoutUser = async () => {
    const {error} = await supabase.auth.signOut();

    if(error){
        console.log("LogoutError:",error.message)
    }
  }
  return (
    <>
      {session ? (
        <div className="hidden lg:block space-y-2">
          <button onClick={LogoutUser} className="bg-white text-black p-3 w-full font-bold rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
            Logout
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-transparent border border-red-500 text-red-500 p-3 w-full font-bold rounded-full cursor-pointer hover:bg-red-500/10 transition-colors"
          >
            Delete Account
          </button>
        </div>
      ) : (
        <Link
          href="/"
          className="hidden lg:block text-center bg-white text-black p-3 w-full mt-3 font-bold rounded-full cursor-pointer"
        >
          Log In
        </Link>
      )}
      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
    </>
  );
}
