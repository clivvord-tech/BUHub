"use client";
import React from "react";
import dynamic from "next/dynamic";

const MessagesClient = dynamic(() => import("@/components/MessagesClient"), { ssr: false });

export default function MessagesPage() {
  return (
    <div className="min-h-screen">
      <MessagesClient />
    </div>
  );
}
