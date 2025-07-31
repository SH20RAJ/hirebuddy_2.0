import Jobs from "@/pages/Jobs";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function JobsPage() {
    return (
        <ProtectedRoute>
            <Jobs />
        </ProtectedRoute>
    );
}