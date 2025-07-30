'use client'

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Jobs from "@/pages/Jobs";

export default function JobsPage() {
  return (
    <ProtectedRoute>
      <Jobs />
    </ProtectedRoute>
  );
}