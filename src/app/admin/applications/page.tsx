import JobApplicationsAdmin from "@/pages/JobApplicationsAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function JobApplicationsAdminPage() {
    return (
        <ProtectedRoute>
            <JobApplicationsAdmin />
        </ProtectedRoute>
    );
}