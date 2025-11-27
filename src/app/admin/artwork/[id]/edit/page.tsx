import { notFound } from 'next/navigation';
import { getArtworkById } from '@/lib/db/admin/artwork';
import ArtworkForm from '@/components/admin/artwork/ArtworkForm';
import { updateArtworkAction } from '@/app/admin/artwork/actions';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditArtworkPage({ params }: PageProps) {
    const { id } = await params;
    const { data: artwork, error } = await getArtworkById(id);

    if (error || !artwork) {
        notFound();
    }

    const handleSubmit = async (
        data: Parameters<typeof updateArtworkAction>[1]
    ) => {
        'use server';
        await updateArtworkAction(id, data);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="admin-page-header">Edit Artwork</h1>
            <ArtworkForm initialData={artwork} onSubmit={handleSubmit} />
        </div>
    );
}
