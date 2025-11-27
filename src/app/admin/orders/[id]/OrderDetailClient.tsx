'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type OrderWithItems, type OrderStatus } from '@/lib/db/admin/orders';
import {
    updateStatusAction,
    addNoteAction,
    addTrackingAction,
} from '../actions';

interface OrderDetailClientProps {
    order: OrderWithItems;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
    const router = useRouter();
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
        order.status
    );
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);

    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteError, setNoteError] = useState<string | null>(null);

    const [trackingNumber, setTrackingNumber] = useState(
        order.shipping_tracking_number || ''
    );
    const [isSavingTracking, setIsSavingTracking] = useState(false);
    const [trackingError, setTrackingError] = useState<string | null>(null);

    const handleStatusUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingStatus(true);
        setStatusError(null);

        try {
            await updateStatusAction(order.id, selectedStatus);
            router.refresh();
        } catch (error) {
            setStatusError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update status'
            );
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsAddingNote(true);
        setNoteError(null);

        try {
            await addNoteAction(order.id, newNote.trim());
            setNewNote('');
            router.refresh();
        } catch (error) {
            setNoteError(
                error instanceof Error ? error.message : 'Failed to add note'
            );
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleSaveTracking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        setIsSavingTracking(true);
        setTrackingError(null);

        try {
            await addTrackingAction(order.id, trackingNumber.trim());
            router.refresh();
        } catch (error) {
            setTrackingError(
                error instanceof Error
                    ? error.message
                    : 'Failed to save tracking number'
            );
        } finally {
            setIsSavingTracking(false);
        }
    };

    return (
        <>
            {/* Status Update Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Update Status
                </h2>
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Order Status
                        </label>
                        <select
                            id="status"
                            value={selectedStatus}
                            onChange={(e) =>
                                setSelectedStatus(e.target.value as OrderStatus)
                            }
                            disabled={isUpdatingStatus}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {statusError && (
                        <div className="text-red-600 text-sm">
                            {statusError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={
                            isUpdatingStatus || selectedStatus === order.status
                        }
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                    </button>
                </form>
            </div>

            {/* Tracking Number Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Shipping Tracking
                </h2>
                <form onSubmit={handleSaveTracking} className="space-y-4">
                    <div>
                        <label
                            htmlFor="tracking"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Tracking Number
                        </label>
                        <input
                            type="text"
                            id="tracking"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            disabled={isSavingTracking}
                            placeholder="Enter tracking number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        />
                    </div>

                    {trackingError && (
                        <div className="text-red-600 text-sm">
                            {trackingError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={
                            isSavingTracking ||
                            !trackingNumber.trim() ||
                            trackingNumber === order.shipping_tracking_number
                        }
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSavingTracking ? 'Saving...' : 'Save Tracking'}
                    </button>
                </form>
            </div>

            {/* Admin Notes Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Add Admin Note
                </h2>
                <form onSubmit={handleAddNote} className="space-y-4">
                    <div>
                        <label
                            htmlFor="note"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Add Admin Note
                        </label>
                        <textarea
                            id="note"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            disabled={isAddingNote}
                            placeholder="Enter note for internal use"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        />
                    </div>

                    {noteError && (
                        <div className="text-red-600 text-sm">{noteError}</div>
                    )}

                    <button
                        type="submit"
                        disabled={isAddingNote || !newNote.trim()}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAddingNote ? 'Saving...' : 'Save Note'}
                    </button>
                </form>
            </div>
        </>
    );
}
