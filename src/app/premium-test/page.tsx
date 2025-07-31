import PremiumTest from "@/pages/PremiumTest";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function PremiumTestPage() {
    return (
        <ProtectedRoute>
            <PremiumTest />
        </ProtectedRoute>
    );
}