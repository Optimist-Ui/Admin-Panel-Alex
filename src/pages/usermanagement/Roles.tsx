import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, TextField, Checkbox, FormControlLabel, CircularProgress, Grid, FormGroup, Typography, Tooltip } from '@mui/material';
import { FaTrash, FaPencilAlt, FaEye, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useRolesListing } from '../../hooks/useRolesListing';
import { usePermissionsListing } from '../../hooks/usePermissionsListing';
import { useRoleDelete } from '../../hooks/roles/useRoleDelete';
import { useAddRole } from '../../hooks/roles/useAddRole';
import { useGetRoleById } from '../../hooks/roles/useGetRoleById';
import { useUpdateRole } from '../../hooks/roles/useUpdateRole';

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const Roles: React.FC = () => {
    const [currentRole, setCurrentRole] = useState({
        id: '',
        name: '',
        permissions: [] as string[],
    });
    const [search, setSearch] = useState('');

    const { roles, loading: rolesLoading, error: rolesError, refetchRoles } = useRolesListing();
    const { permissions, loading: permissionsLoading, error: permissionsError } = usePermissionsListing();
    const { deleteRole, loading: deleteLoading, error: deleteError } = useRoleDelete();
    const { addRole, loading: addLoading, error: addError } = useAddRole();
    const { updateRole, loading: updateLoading, error: updateError } = useUpdateRole();
    const { role, loading: roleLoading, error: roleError, refetchRole } = useGetRoleById(currentRole.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);

    // Handle Modal Open/Close
    const handleOpenModal = (role?: any, viewOnly = false) => {
        setViewOnly(viewOnly);
        setIsModalOpen(true);

        if (role) {
            refetchRole(); // Refetch role data to ensure synchronization
            setCurrentRole({
                id: role.id,
                name: role.name,
                permissions: role.permissions,
            });
        } else {
            setCurrentRole({ id: '', name: '', permissions: [] });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRole({ id: '', name: '', permissions: [] }); // Reset `currentRole` on modal close
    };

    const handleFormSubmit = async () => {
        if (!currentRole.name.trim()) {
            alert('Role name is required!');
            return;
        }

        const mappedPermissions = currentRole.permissions.map((permissionName) => {
            const matchedPermission = permissions.find((perm) => perm.name === permissionName);
            return matchedPermission ? matchedPermission.id : permissionName;
        });

        let success = false;

        if (currentRole.id) {
            success = await updateRole({
                id: currentRole.id,
                name: currentRole.name,
                permissions: mappedPermissions,
            });
        } else {
            success = await addRole({
                name: currentRole.name,
                permissions: mappedPermissions,
            });
        }

        if (success) {
            Swal.fire({
                title: 'Success!',
                text: `The role has been ${currentRole.id ? 'updated' : 'added'}.`,
                icon: 'success',
            });
            refetchRoles();
            handleCloseModal();
        } else {
            Swal.fire({
                title: 'Error!',
                text: currentRole.id ? updateError || 'Failed to update role' : addError || 'Failed to add role',
                icon: 'error',
            });
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setCurrentRole((prev) => ({ ...prev, [field]: value }));
    };

    const handleDeleteRole = async (roleId: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to undo this action!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            const success = await deleteRole(roleId);
            if (success) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The role has been deleted.',
                    icon: 'success',
                });
                refetchRoles();
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: deleteError || 'Failed to delete role',
                    icon: 'error',
                });
            }
        }
    };

    useEffect(() => {
        if (role) {
            setCurrentRole({
                id: role.id,
                name: role.name,
                permissions: role.permissions,
            });
        }
    }, [role]);

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex justify-between items-center mb-5">
                    <h5 className="font-bold text-2xl dark:text-white-light ml-2 flex items-center">All Roles</h5>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button type="button" onClick={() => handleOpenModal(undefined, false)} className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary">
                        Add New Role
                    </button>
                </div>

                <div className="table-responsive mb-5 overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-200">
                            <tr className="bg-gray-100 flex items-center text-center justify-between px-5">
                                <th className="p-2">Role</th>
                                <th className="p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rolesLoading ? (
                                <tr>
                                    <td colSpan={2} className="text-center">
                                        <CircularProgress />
                                    </td>
                                </tr>
                            ) : rolesError ? (
                                <tr>
                                    <td colSpan={2} className="text-center text-red-500">
                                        {rolesError}
                                    </td>
                                </tr>
                            ) : roles.filter((role) => role.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="text-center">
                                        No roles available
                                    </td>
                                </tr>
                            ) : (
                                roles
                                    .filter((role) => role.name.toLowerCase().includes(search.toLowerCase()))
                                    .map((role) => (
                                        <tr key={role.id} className="border-b hover:bg-gray-100 flex justify-between w-full items-center text-center">
                                            <td className="p-2">{role.name}</td>
                                            <td>
                                                <div className="flex items-center justify-start">
                                                    <Button style={{ minWidth: 'auto' }} type="button" onClick={() => handleOpenModal(role, false)}>
                                                        <FaPencilAlt />
                                                    </Button>
                                                    <Button style={{ minWidth: 'auto' }} type="button" onClick={() => handleDeleteRole(role.id)}>
                                                        {deleteLoading ? <CircularProgress size={20} /> : <FaTrash />}
                                                    </Button>
                                                    <Button style={{ minWidth: 'auto' }} type="button" onClick={() => handleOpenModal(role, true)}>
                                                        <FaEye />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    <h2>{currentRole.id ? (viewOnly ? 'View Role' : 'Edit Role') : 'Add Role'}</h2>
                    <TextField label="Role Name" value={currentRole.name} onChange={(e) => handleInputChange('name', e.target.value)} fullWidth disabled={viewOnly} margin="normal" />
                    <div className="permissions">
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Permissions
                        </Typography>
                        {permissionsLoading || !currentRole.permissions ? (
                            <CircularProgress />
                        ) : permissionsError ? (
                            <p className="text-red-500">{permissionsError}</p>
                        ) : (
                            <FormGroup sx={{ mt: 2 }}>
                                <Grid container>
                                    {permissions.map((perm) => (
                                        <Grid item xs={12} sm={6} md={5} key={perm.id}>
                                            <Tooltip title={perm.name || 'No description available'}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={currentRole.permissions.includes(perm.name)}
                                                            onChange={(e) => {
                                                                const updatedPermissions = e.target.checked
                                                                    ? [...currentRole.permissions, perm.name]
                                                                    : currentRole.permissions.filter((name) => name !== perm.name);
                                                                handleInputChange('permissions', updatedPermissions);
                                                            }}
                                                            disabled={viewOnly}
                                                        />
                                                    }
                                                    label={perm.name.replace(/_/g, ' ')}
                                                />
                                            </Tooltip>
                                        </Grid>
                                    ))}
                                </Grid>
                            </FormGroup>
                        )}
                    </div>
                    {!viewOnly && (
                        <Button variant="contained" color="primary" onClick={handleFormSubmit} sx={{ mt: 2 }} disabled={addLoading || updateLoading}>
                            {addLoading || updateLoading ? <CircularProgress size={24} /> : currentRole.id ? 'Update Role' : 'Add Role'}
                        </Button>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default Roles;
