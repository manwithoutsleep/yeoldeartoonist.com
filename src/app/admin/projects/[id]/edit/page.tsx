import ProjectForm from '@/components/admin/ProjectForm';
import { getProjectById } from '@/lib/db/admin/projects';
import { updateProjectAction } from '@/app/admin/projects/actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditProjectPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProjectPage({
    params,
}: EditProjectPageProps) {
    const { id } = await params;
    const { data: project, error } = await getProjectById(id);

    if (error || !project) {
        notFound();
    }

    // Bind the id to the action using .bind()
    const boundUpdateAction = updateProjectAction.bind(null, id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Edit Project
                </h1>
                <Link
                    href="/admin/projects"
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    Back to Projects
                </Link>
            </div>

            <ProjectForm initialData={project} onSubmit={boundUpdateAction} />
        </div>
    );
}
