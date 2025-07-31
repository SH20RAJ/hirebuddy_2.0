import EmailOutreach from "@/pages/EmailOutreach";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function EmailOutreachPage() {
    return (
        <ProtectedRoute>
            <EmailOutreach />
        </ProtectedRoute>
    );
}