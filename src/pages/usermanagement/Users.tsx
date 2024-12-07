import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useUsersListing, User } from '../../hooks/useUsersListing';
import { useDeleteUser } from '../../hooks/users/useDeleteUser';
import { useUpdateUser } from '../../hooks/users/useUpdateUser';

const PAGE_SIZES = [10, 20, 30, 50, 100];

const Users = (): JSX.Element => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('User Management'));
    }, [dispatch]);

    const { users, loading: usersLoading, error: usersError, refetchUsers } = useUsersListing();
    const { deleteUser, loading: deleteLoading, error: deleteError } = useDeleteUser();
    const { updateUser, loading: updateLoading, error: updateError } = useUpdateUser();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [recordsData, setRecordsData] = useState<User[]>([]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();
        const filtered = users.filter((user) => [user.id, user.name, user.email, user.sellerType, user.isAlreadyAgent, user.isVerified].join(' ').toLowerCase().includes(lowercasedSearch));
        setFilteredUsers(filtered);
    }, [search, users]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData(filteredUsers.slice(from, to));
    }, [page, pageSize, filteredUsers]);

    const handleEdit = (user: User): void => {
        Swal.fire({
            title: 'Edit User',
            html: `
                <div style="display: flex; color: #333; flex-direction: column; gap: 10px;">
                    <input id="swal-input1" class="swal2-input" placeholder="Name" autofocus  value="${user.name}" required />
                    <input id="swal-input2" class="swal2-input" placeholder="Email" value="${user.email}" required />
                    <input id="swal-input3" class="swal2-input" placeholder="Seller Type" value="${user.sellerType || ''}" />
                    <div  class="flex  justify-center  text-[#333] text-start text-nowrap gap-5 my-5 grid-flow-row items-center">
                    <label class="flex justify-center items-center">
                        <input id="swal-input4" type="checkbox" class="mx-2 cursor-pointer" style="transform: scale(1.5)" ${user.isAlreadyAgent ? 'checked' : ''} />
                        Already Agent
                    </label>
                    <label class="flex justify-center items-center">
                        <input id="swal-input5" type="checkbox" class="mx-2 cursor-pointer" style="transform: scale(1.5)" ${user.isVerified ? 'checked' : ''} />
                        Verified
                    </label>
                </div>
                
                </div>
            `,
            confirmButtonText: 'Save',
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById('swal-input1') as HTMLInputElement).value.trim();
                const email = (document.getElementById('swal-input2') as HTMLInputElement).value.trim();
                const sellerType = (document.getElementById('swal-input3') as HTMLInputElement).value.trim();
                const is_already_agent = (document.getElementById('swal-input4') as HTMLInputElement).checked;
                const isVerified = (document.getElementById('swal-input5') as HTMLInputElement).checked;

                if (!name || !email) {
                    Swal.showValidationMessage('Name and Email are required');
                    return;
                }

                if (!/^\S+@\S+\.\S+$/.test(email)) {
                    Swal.showValidationMessage('Invalid email format');
                    return;
                }

                return { name, email, sellerType, is_already_agent, isVerified };
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const success = await updateUser(user.id, result.value);
                if (success) {
                    Swal.fire('Updated!', 'User details have been updated.', 'success');
                    refetchUsers();
                } else {
                    Swal.fire('Error!', updateError || 'Failed to update user.', 'error');
                }
            }
        });
    };

    const handleAdd = (): void => {
        Swal.fire({
            title: 'Add New User',
            html: `...`, // Add user form here as needed
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('New user:', result.value);
            }
        });
    };

    const handleDelete = (userId: string): void => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const success = await deleteUser(userId);
                if (success) {
                    Swal.fire('Deleted!', 'User has been deleted successfully.', 'success');
                    refetchUsers();
                } else {
                    Swal.fire('Error!', deleteError || 'Failed to delete user.', 'error');
                }
            }
        });
    };

    if (usersLoading) return <div>Loading...</div>;
    if (usersError) return <div>Error: {usersError}</div>;

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex justify-between items-center mb-5">
                    <h5 className="font-semibold text-2xl dark:text-white-light ml-2">All Users</h5>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary" onClick={handleAdd}>
                        Add New User
                    </button>
                </div>

                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={recordsData}
                        columns={[
                            { accessor: 'id', title: 'ID', sortable: true },
                            { accessor: 'name', title: 'Name', sortable: true },
                            { accessor: 'email', title: 'Email', sortable: true },
                            {
                                accessor: 'sellerType',
                                title: 'Seller Type',
                                render: (record) => (record.sellerType ? record.sellerType : 'N/A'),
                            },
                            {
                                accessor: 'isAlreadyAgent',
                                title: 'Already Agent',
                                render: (record) => (record.isAlreadyAgent ? 'Yes' : 'No'),
                            },
                            {
                                accessor: 'isVerified',
                                title: 'Verified',
                                render: (record) => (record.isVerified ? 'Yes' : 'No'),
                            },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (record) => (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(record)} disabled={updateLoading}>
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(record.id)} disabled={deleteLoading}>
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={filteredUsers.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default Users;
