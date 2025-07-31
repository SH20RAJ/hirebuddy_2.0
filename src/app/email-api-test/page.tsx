import EmailAPITest from "@/pages/EmailAPITest";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function EmailAPITestPage() {
    return (
        <ProtectedRoute>
            <EmailAPITest />
        </ProtectedRoute>
    );
}