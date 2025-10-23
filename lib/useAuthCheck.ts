"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useAuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      router.push("/login");
    }
  }, [router]);
}
