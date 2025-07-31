import ResumeBuilder from "@/pages/ResumeBuilder";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ResumeBuilderFormPage() {
    return (
        <ProtectedRoute>
            <ResumeBuilder />
        </ProtectedRoute>
    );
}