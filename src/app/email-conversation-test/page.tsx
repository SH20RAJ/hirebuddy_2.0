import EmailConversationTest from "@/pages/EmailConversationTest";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function EmailConversationTestPage() {
    return (
        <ProtectedRoute>
            <EmailConversationTest />
        </ProtectedRoute>
    );
}