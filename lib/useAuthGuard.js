"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔒 Not logged in
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // 🔒 Admin-only
      if (pathname.startsWith("/admin") && decoded.role !== "ADMIN") {
        router.replace("/admin");
      }
    } catch {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [pathname, router]);
}
