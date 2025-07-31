import ResumeChoice from "@/pages/ResumeChoice";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ResumeBuilderPage() {
    return (
        <ProtectedRoute>
            <ResumeChoice />
        </ProtectedRoute>
    );
}