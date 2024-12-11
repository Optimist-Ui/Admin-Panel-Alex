import React, { useState } from 'react';
import { usePermissionsListing } from '../../hooks/usePermissionsListing';
import { CircularProgress } from '@mui/material';

const Permissions = () => {
    const { permissions, loading, error } = usePermissionsListing();
    const [search, setSearch] = useState<string>('');

    // Filtered permissions based on the search query
    const filteredPermissions = permissions.filter((perm) => perm.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return (
            <div className="text-center py-10">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="panel mt-6">
            <div className="flex justify-between items-center mb-5">
                <h5 className="font-bold text-2xl dark:text-white-light ml-2 flex items-center">All Permissions</h5>
            </div>

            {/* Search Bar */}
            <div className="flex justify-between items-center mb-5 gap-5">
                <div />
                <input type="text" className="form-input w-auto" placeholder="Search permissions..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Permissions Table */}
            <div className="table-responsive mb-5 overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-200">
                        <tr className="bg-gray-100 flex items-center text-center justify-between p-2">
                            <th className="p-2">Permission Name</th>
                            <th className="p-2">Permission ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPermissions.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="text-center">
                                    No permissions found.
                                </td>
                            </tr>
                        ) : (
                            filteredPermissions.map((perm) => (
                                <tr key={perm.id} className="border-b hover:bg-gray-100 flex justify-between w-full items-center text-center ">
                                    <td className="p-2">{perm.name}</td>
                                    <td className="p-2">{perm.id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Permissions;
