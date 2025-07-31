import CoverLetterTest from "@/pages/CoverLetterTest";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CoverLetterTestPage() {
    return (
        <ProtectedRoute>
            <CoverLetterTest />
        </ProtectedRoute>
    );
}