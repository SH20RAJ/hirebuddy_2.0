'use client'

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Profile from "@/pages/Profile";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}