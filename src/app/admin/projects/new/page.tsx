import ProjectForm from '@/components/admin/ProjectForm';
import { createProjectAction } from '@/app/admin/projects/actions';
import Link from 'next/link';

export default function NewProjectPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Create New Project
                </h1>
                <Link
                    href="/admin/projects"
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    Back to Projects
                </Link>
            </div>

            <ProjectForm onSubmit={createProjectAction} />
        </div>
    );
}
