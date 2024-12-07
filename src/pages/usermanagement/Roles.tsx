import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import { useRolesListing } from '../../hooks/useRolesListing';
import { useRoleDelete } from '../../hooks/roles/useRoleDelete';
import { useAddRole } from '../../hooks/roles/useAddRole';
import { useUpdateRole } from '../../hooks/roles/useUpdateRole';

const Roles: React.FC = () => {
    const { roles, loading: rolesLoading, error: rolesError, refetchRoles } = useRolesListing();
    const { deleteRole, loading: deleteLoading, error: deleteError } = useRoleDelete();
    const { addRole, loading: addLoading, error: addError } = useAddRole();
    const { updateRole, loading: updateLoading, error: updateError } = useUpdateRole();
    const [search, setSearch] = useState<string>('');

    // Filter roles based on search query
    const filteredRoles = roles.filter((role) => role.name.toLowerCase().includes(search.toLowerCase()));

    // Handle Add Role
    const handleAddRole = async (newRole: { name: string }) => {
        if (roles.some((role) => role.name.toLowerCase() === newRole.name.toLowerCase())) {
            Swal.fire({
                icon: 'error',
                title: 'Role Already Exists',
                text: 'Please choose a different name for the role.',
            });
            return;
        }

        const success = await addRole(newRole);
        if (success) {
            Swal.fire('Success', 'Role added successfully.', 'success');
            refetchRoles(); // Refetch roles after adding
        } else {
            Swal.fire('Error', addError || 'Failed to add role.', 'error');
        }
    };

    // Handle Update Role
    const handleUpdateRole = async (id: string, currentName: string) => {
        Swal.fire({
            title: 'Edit Role',
            html: `<input id="editRoleName" class="swal2-input" value="${currentName}" required />`,
            focusConfirm: false,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Update',
            preConfirm: () => {
                const roleName = (document.getElementById('editRoleName') as HTMLInputElement).value.trim();
                if (!roleName) {
                    Swal.showValidationMessage('Role Name is required!');
                    return false;
                }
                return roleName;
            },
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                const roleName = result.value;
                if (roles.some((role) => role.name.toLowerCase() === roleName.toLowerCase() && role.id !== id)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Role Already Exists',
                        text: 'Please choose a different name for the role.',
                    });
                    return;
                }

                const success = await updateRole({ id, name: roleName });
                if (success) {
                    Swal.fire('Success', 'Role updated successfully.', 'success');
                    refetchRoles(); // Refetch roles after updating
                } else {
                    Swal.fire('Error', updateError || 'Failed to update role.', 'error');
                }
            }
        });
    };

    // Handle Delete Role
    const handleDeleteRole = (id: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const success = await deleteRole(id);
                if (success) {
                    Swal.fire('Deleted!', 'Role has been deleted successfully.', 'success');
                    refetchRoles(); // Refetch roles to update the state
                } else {
                    Swal.fire('Error!', deleteError || 'Failed to delete the role.', 'error');
                }
            }
        });
    };

    if (rolesLoading) {
        return <div className="text-center py-10">Loading roles...</div>;
    }

    if (rolesError) {
        return <div className="text-center py-10 text-red-500">{rolesError}</div>;
    }

    return (
        <div className="flex flex-col py-10 dark:bg-transparent">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2">Roles</h2>
                <p className="text-gray-500">Manage roles with ease. Use the buttons to edit or delete existing roles or add a new role below.</p>
            </div>

            {/* Search Bar and Add Role Button */}
            <div className="flex justify-between items-center mb-8">
                <input
                    type="text"
                    placeholder="Search roles"
                    className="form-input w-full max-w-md border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    className="btn btn-primary py-2 px-4 ml-4 hover:bg-white hover:text-primary hover:border-primary"
                    onClick={() =>
                        Swal.fire({
                            title: 'Add Role',
                            html: `<input id="roleName" class="swal2-input" placeholder="Role Name" required />`,
                            focusConfirm: false,
                            showCancelButton: true,
                            cancelButtonText: 'Cancel',
                            confirmButtonText: 'Add',
                            preConfirm: () => {
                                const roleName = (document.getElementById('roleName') as HTMLInputElement).value.trim();
                                if (!roleName) {
                                    Swal.showValidationMessage('Role Name is required!');
                                    return false;
                                }

                                handleAddRole({ name: roleName });
                            },
                        })
                    }
                >
                    {addLoading ? 'Adding...' : 'Add Role'}
                </button>
            </div>

            {/* Roles List */}
            <div className="bg-white shadow-md rounded-md p-6 dark:bg-transparent">
                {filteredRoles.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRoles.map((role) => (
                            <div key={role.id} className="flex items-center justify-between p-4 bg-gray-100 border border-gray-300 rounded-md dark:bg-transparent">
                                <span className="text-lg font-medium">{role.name}</span>
                                <div className="flex space-x-2">
                                    <button className="btn btn-warning text-sm dark:bg-transparent" onClick={() => handleUpdateRole(role.id, role.name)} disabled={updateLoading}>
                                        <FaPencilAlt />
                                    </button>
                                    <button className="btn btn-danger text-sm dark:bg-transparent" onClick={() => handleDeleteRole(role.id)} disabled={deleteLoading}>
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">No roles found. Try adjusting your search criteria.</div>
                )}
            </div>
        </div>
    );
};

export default Roles;
