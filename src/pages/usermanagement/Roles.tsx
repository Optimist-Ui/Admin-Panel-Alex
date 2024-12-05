import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaTrash, FaPencilAlt, FaEye, FaPlus } from 'react-icons/fa';

interface TableData {
    id: number;
    role: string;
    createProperty: boolean;
    editProperty: boolean;
    deleteProperty: boolean;
    updateProperty: boolean;
}

const initialTableData: TableData[] = [
    { id: 1, role: 'Agent', createProperty: true, editProperty: false, deleteProperty: true, updateProperty: false },
    { id: 2, role: 'Agency', createProperty: false, editProperty: true, deleteProperty: false, updateProperty: true },
    { id: 3, role: 'Admin', createProperty: true, editProperty: true, deleteProperty: true, updateProperty: true },
];

const Roles: React.FC = () => {
    const [tableData, setTableData] = useState<TableData[]>(initialTableData);

    // Handle Add New Role
    const handleAddRole = (newRole: TableData) => {
        setTableData((prev) => [...prev, { ...newRole, id: prev.length + 1 }]);
    };

    // Handle Modal Submission for Edit/View
    const handleModalSubmit = (updatedRole: TableData) => {
        setTableData((prev) => prev.map((item) => (item.id === updatedRole.id ? updatedRole : item)));
    };

    // Handle Delete Role with SweetAlert
    const handleDeleteRole = (roleId: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this role!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                setTableData((prev) => prev.filter((item) => item.id !== roleId));
                Swal.fire('Deleted!', 'Your role has been deleted.', 'success');
            }
        });
    };

    // Handle Edit/View Role with SweetAlert Modal
    const handleRoleModal = (role?: TableData, viewOnly = false) => {
        const defaultData = role || { id: 0, role: '', createProperty: false, editProperty: false, deleteProperty: false, updateProperty: false };
        Swal.fire({
            title: role ? 'Edit Role' : 'Add Role',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            html: `
                <input id="roleName" class="swal2-input text-[#333]" placeholder="Role Name" required value="${defaultData.role}" ${viewOnly ? 'disabled' : ''} />
                <h3 class="text-start my-5">Permissions</h3>
                <div class="grid grid-cols-2 justify-items-start text-[#333] text-start text-nowrap gap-5 my-5 grid-flow-row content-between">
                    <label><input type="checkbox" class="text-nowrap" id="createProperty" ${defaultData.createProperty ? 'checked' : ''} ${
                viewOnly ? 'disabled' : ''
            } style="transform: scale(1.5);" /> Create Property</label>
                    <label><input type="checkbox" id="editProperty" ${defaultData.editProperty ? 'checked' : ''} ${viewOnly ? 'disabled' : ''} style="transform: scale(1.5);" /> Edit Property</label>
                    <label><input type="checkbox" id="deleteProperty" ${defaultData.deleteProperty ? 'checked' : ''} ${
                viewOnly ? 'disabled' : ''
            } style="transform: scale(1.5);" /> Delete Property</label>
                    <label><input type="checkbox" id="updateProperty" ${defaultData.updateProperty ? 'checked' : ''} ${
                viewOnly ? 'disabled' : ''
            } style="transform: scale(1.5);" /> Update Property</label>
                </div>
            `,
            focusConfirm: false,
            preConfirm: () => {
                const roleName = (document.getElementById('roleName') as HTMLInputElement).value.trim(); // Trim any whitespace
                if (!roleName) {
                    Swal.showValidationMessage('Role Name is required!'); // Show validation message
                    return false; // Prevent form submission
                }

                const createProperty = (document.getElementById('createProperty') as HTMLInputElement).checked;
                const editProperty = (document.getElementById('editProperty') as HTMLInputElement).checked;
                const deleteProperty = (document.getElementById('deleteProperty') as HTMLInputElement).checked;
                const updateProperty = (document.getElementById('updateProperty') as HTMLInputElement).checked;

                const updatedRole: TableData = {
                    id: role ? role.id : Date.now(),
                    role: roleName,
                    createProperty,
                    editProperty,
                    deleteProperty,
                    updateProperty,
                };

                if (role) {
                    handleModalSubmit(updatedRole); // Update the existing role
                } else {
                    handleAddRole(updatedRole); // Add new role to the table
                }
            },
        });
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex justify-between items-center mb-5">
                    <h5 className="font-bold text-2xl dark:text-white-light ml-2 flex items-center">
                        Roles
                        <button
                            type="button"
                            onClick={() => handleRoleModal(undefined, false)} // Open modal for adding new role
                            className="ml-3 rounded-full text-primary border-primary border p-1 hover:text-white hover:bg-primary transition-all duration-300"
                        >
                            <FaPlus /> {/* Add Icon */}
                        </button>
                    </h5>
                </div>

                <div className="table-responsive mb-5 overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Role</th>
                                <th className="p-2">Action</th>
                                <th className="text-center p-2">Create Property</th>
                                <th className="text-center p-2">Edit Property</th>
                                <th className="text-center p-2">Delete Property</th>
                                <th className="text-center p-2">Update Property</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((data) => (
                                <tr key={data.id} className="border-t">
                                    <td className="p-2">{data.role}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRoleModal(data, false)} // Open modal for editing role
                                                className="text-primary"
                                            >
                                                <FaPencilAlt /> {/* Edit */}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRole(data.id)} // SweetAlert delete
                                                className="text-danger"
                                            >
                                                <FaTrash /> {/* Delete */}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRoleModal(data, true)} // View role details (view-only mode)
                                                className="text-info"
                                            >
                                                <FaEye /> {/* View */}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="text-center p-2">
                                        <span className={`badge ${data.createProperty ? 'bg-success' : 'bg-danger'}`}>{data.createProperty ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td className="text-center p-2">
                                        <span className={`badge ${data.editProperty ? 'bg-success' : 'bg-danger'}`}>{data.editProperty ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td className="text-center p-2">
                                        <span className={`badge ${data.deleteProperty ? 'bg-success' : 'bg-danger'}`}>{data.deleteProperty ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td className="text-center p-2">
                                        <span className={`badge ${data.deleteProperty ? 'bg-success' : 'bg-danger'}`}>{data.deleteProperty ? 'Yes' : 'No'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Roles;
