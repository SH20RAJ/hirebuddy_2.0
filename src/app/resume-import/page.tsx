import { ResumeImportPage } from "@/pages/ResumeImportPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ResumeImport() {
    return (
        <ProtectedRoute>
            <ResumeImportPage />
        </ProtectedRoute>
    );
}