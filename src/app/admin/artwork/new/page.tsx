import ArtworkForm from '@/components/admin/artwork/ArtworkForm';
import { createArtworkAction } from '../actions';

export default function CreateArtworkPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
                Add New Artwork
            </h1>
            <ArtworkForm onSubmit={createArtworkAction} />
        </div>
    );
}
