import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';

// Define the type for permission data
interface PermissionData {
    id: number;
    name: string;
}

const Permissions = () => {
    const [permissions, setPermissions] = useState<PermissionData[]>([]);
    const [search, setSearch] = useState<string>('');

    // Function to handle adding a new permission
    const handleAddPermission = (newPermission: PermissionData) => {
        // Check if the permission already exists
        if (permissions.some((perm) => perm.name === newPermission.name)) {
            Swal.fire({
                icon: 'error',
                title: 'Permission Already Exists',
                text: 'Please choose a different name for the permission.',
            });
            return;
        }

        setPermissions((prev) => [...prev, newPermission]);
        showToast('success');
    };

    // Function to handle deleting a permission
    const handleDeletePermission = (id: number) => {
        setPermissions((prev) => prev.filter((perm) => perm.id !== id));
        showToast('danger');
    };

    // Function to handle editing a permission
    const handleEditPermission = (updatedPermission: PermissionData) => {
        setPermissions((prev) => prev.map((perm) => (perm.id === updatedPermission.id ? updatedPermission : perm)));
        showToast('info');
    };

    // Toast notification
    const showToast = (color: string) => {
        const toast = Swal.mixin({
            toast: true,
            position: 'bottom-end', // Move to the top-right
            showConfirmButton: false,
            timer: 3000,
            showCloseButton: true,
            customClass: {
                popup: `color-${color}`,
            },
        });
        toast.fire({
            title: color === 'success' ? 'Permission Added!' : color === 'danger' ? 'Permission Deleted!' : 'Permission Updated!',
        });
    };

    return (
        <div className="flex flex-col max-w-[75%] mx-auto">
            <div className="flex justify-center">
                <h2 className="text-2xl font-bold mb-10">Permissions</h2>
            </div>

            {/* Search bar */}
            <div className="flex md:items-center flex-row justify-between mx-5 gap-5 mb-5">
                <button
                    className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary"
                    onClick={() =>
                        Swal.fire({
                            title: 'Add Permission',
                            html: `
                                <input id="permissionName" class="swal2-input" placeholder="Permission Name" required />
                            `,
                            focusConfirm: false,
                            showCancelButton: true, // Show Cancel button
                            cancelButtonText: 'Cancel', // Text for the Cancel button
                            confirmButtonText: 'Add', // Text for the Confirm button
                            preConfirm: () => {
                                const permissionName = (document.getElementById('permissionName') as HTMLInputElement).value.trim();
                                if (!permissionName) {
                                    Swal.showValidationMessage('Permission Name is required!');
                                    return false;
                                }

                                const newPermission: PermissionData = {
                                    id: Date.now(),
                                    name: permissionName,
                                };

                                handleAddPermission(newPermission);
                            },
                        })
                    }
                >
                    Add Permission
                </button>
                <div className="flex justify-between items-center">
                    <input
                        type="text"
                        placeholder="Search permissions"
                        className="form-input w-auto"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)} // Update search state on input change
                    />
                </div>
            </div>

            {/* Table for permissions */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="">
                            <th className="py-3 px-6 text-center dark:bg-transparent  bg-gray-200">Permission Name</th>
                            <th className="py-3 px-6 text-center dark:bg-transparent  bg-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permissions.length > 0 ? (
                            permissions
                                .filter((perm) => perm.name.toLowerCase().includes(search.toLowerCase())) // Filter based on search term
                                .map((perm) => (
                                    <tr key={perm.id} className="border-b">
                                        <td className="py-3 px-6 text-center">{perm.name}</td>
                                        <td className="py-3 px-6 flex space-x-4 items-center justify-center text-center">
                                            <button
                                                className="btn btn-warning"
                                                onClick={() =>
                                                    Swal.fire({
                                                        title: 'Edit Permission',
                                                        html: `
                                                            <input id="editPermissionName" class="swal2-input" value="${perm.name}" required />
                                                        `,
                                                        focusConfirm: false,
                                                        showCancelButton: true, // Show Cancel button
                                                        cancelButtonText: 'Cancel', // Text for the Cancel button
                                                        confirmButtonText: 'Edit Permission', // Text for the Confirm button
                                                        preConfirm: () => {
                                                            const permissionName = (document.getElementById('editPermissionName') as HTMLInputElement).value.trim();
                                                            if (!permissionName) {
                                                                Swal.showValidationMessage('Permission Name is required!');
                                                                return false;
                                                            }

                                                            const updatedPermission: PermissionData = {
                                                                ...perm,
                                                                name: permissionName,
                                                            };

                                                            handleEditPermission(updatedPermission);
                                                        },
                                                    })
                                                }
                                            >
                                                <FaPencilAlt /> {/* Edit */}
                                            </button>
                                            <button className="btn btn-danger" onClick={() => handleDeletePermission(perm.id)}>
                                                <FaTrash /> {/* Delete */}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="py-3 px-6 text-center dark:text-white-light">
                                    No permissions available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Permissions;
