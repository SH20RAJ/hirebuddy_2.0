'use client'

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ResumeChoice from "@/pages/ResumeChoice";

export default function ResumeBuilderPage() {
  return (
    <ProtectedRoute>
      <ResumeChoice />
    </ProtectedRoute>
  );
}