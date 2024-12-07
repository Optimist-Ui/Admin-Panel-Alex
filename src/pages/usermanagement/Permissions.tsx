import React, { useState } from 'react';
import { usePermissionsListing } from '../../hooks/usePermissionsListing';

const Permissions = () => {
    const { permissions, loading, error } = usePermissionsListing();
    const [search, setSearch] = useState<string>('');

    // Filtered permissions based on the search query
    const filteredPermissions = permissions.filter((perm) => perm.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return <div className="text-center py-10">Loading permissions...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2">Permissions</h2>
                <p className="text-gray-500">View all available permissions below. Use the search bar to quickly find a specific permission.</p>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center mb-8">
                <input
                    type="text"
                    placeholder="Search permissions"
                    className="form-input w-full max-w-md border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Permissions Table */}
            <div className="overflow-x-auto bg-white shadow-md rounded-md p-6 dark:bg-transparent">
                {filteredPermissions.length > 0 ? (
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100 flex items-center text-center justify-between px-5">
                                <th className="px-4 py-2 border-b">Permission Name</th>
                                <th className="px-4 py-2 border-b">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPermissions.map((perm) => (
                                <tr key={perm.id} className="border-b hover:bg-gray-100 flex justify-between w-full items-center text-center">
                                    <td className="px-4 py-2">{perm.name}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 text-xs text-white bg-primary rounded-full">Permission</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center text-gray-500">No permissions found. Try adjusting your search criteria.</div>
                )}
            </div>
        </div>
    );
};

export default Permissions;
