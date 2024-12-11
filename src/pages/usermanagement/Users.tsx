import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Modal, Box, Button, TextField, Checkbox, FormControlLabel, CircularProgress, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import { FaEdit, FaEye, FaTrashAlt } from 'react-icons/fa';
import { useUsersListing, User } from '../../hooks/useUsersListing';
import { useDeleteUser } from '../../hooks/users/useDeleteUser';
import { useUpdateUser } from '../../hooks/users/useUpdateUser';
import { useUserSubHistory } from '../../hooks/users/subscription/useUserSubHistory';
import useAddUser from '../../hooks/users/useAddUser';

// UserData type for AddUser
interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

const PAGE_SIZES = [10, 20, 30, 50, 100];

const Users = (): JSX.Element => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('User Management'));
    }, [dispatch]);

    // Hooks for users
    const { users, loading: usersLoading, error: usersError, refetchUsers } = useUsersListing();
    const { deleteUser, loading: deleteLoading, error: deleteError } = useDeleteUser();
    const { updateUser, loading: updateLoading, error: updateError } = useUpdateUser();
    const { addUser, loading: addingUser, error: addUserError } = useAddUser();

    // Subscription History states
    const [subHistoryModalOpen, setSubHistoryModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const { fetchSubHistory, subHistory, loading: subHistoryLoading, error: subHistoryError } = useUserSubHistory();

    // Pagination and filtering
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [recordsData, setRecordsData] = useState<User[]>([]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Separate states for add and edit modals
    const [addUserData, setAddUserData] = useState<UserData>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });
    const [editUserData, setEditUserData] = useState<Partial<User>>({});

    // Filter and pagination
    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();
        const filtered = users.filter((user) => [user.id, user.name, user.email, user.sellerType, user.is_already_agent, user.isVerified].join(' ').toLowerCase().includes(lowercasedSearch));
        setFilteredUsers(filtered);
    }, [search, users]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData(filteredUsers.slice(from, to));
    }, [page, pageSize, filteredUsers]);

    // Modal Handlers
    const handleOpenAddModal = (): void => {
        setAddUserData({ first_name: '', last_name: '', email: '', password: '' });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (user: User): void => {
        setEditUserData(user);
        setIsEditModalOpen(true);
    };

    const handleCloseModals = (): void => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setAddUserData({ first_name: '', last_name: '', email: '', password: '' });
        setEditUserData({});
    };

    // Add User Submit
    const handleAddUserSubmit = async (): Promise<void> => {
        const { first_name, last_name, email, password } = addUserData;

        if (!first_name || !last_name || !email || !password) {
            Swal.fire('Error', 'All fields are required', 'error');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            Swal.fire('Error', 'Invalid email format', 'error');
            return;
        }

        await addUser(addUserData);

        if (!addUserError) {
            Swal.fire('Success', 'User added successfully', 'success');
            refetchUsers();
            handleCloseModals();
        } else {
            Swal.fire('Error', addUserError || 'Failed to add user', 'error');
        }
    };

    // Edit User Submit
    const handleEditUserSubmit = async (): Promise<void> => {
        const { name, email, sellerType, is_already_agent, isVerified } = editUserData;
        if (!name || !email) {
            Swal.fire('Error', 'Name and Email are required', 'error');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            Swal.fire('Error', 'Invalid email format', 'error');
            return;
        }
        const success = await updateUser(editUserData.id!, { name, email, sellerType, is_already_agent, isVerified });

        if (success) {
            Swal.fire('Success', 'User updated successfully', 'success');
            refetchUsers();
            handleCloseModals();
        } else {
            Swal.fire('Error', updateError || 'Failed to save user', 'error');
        }
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

    const handleOpenSubHistoryModal = async (userId: string): Promise<void> => {
        setCurrentUserId(userId);
        setSubHistoryModalOpen(true);

        await fetchSubHistory(userId);
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
                    <button className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary" onClick={handleOpenAddModal}>
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
                                accessor: 'is_already_agent',
                                title: 'Already Agent',
                                render: (record) => (record.is_already_agent ? 'Yes' : 'No'),
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
                                    <div className="flex justify-start items-center">
                                        <Button style={{ minWidth: 'auto' }} onClick={() => handleOpenEditModal(record)} disabled={updateLoading}>
                                            <FaEdit />
                                        </Button>
                                        <Button style={{ minWidth: 'auto' }} onClick={() => handleDelete(record.id)} disabled={deleteLoading}>
                                            <FaTrashAlt />
                                        </Button>
                                        <Button style={{ minWidth: 'auto' }} type="button" onClick={() => handleOpenSubHistoryModal(record.id)}>
                                            <FaEye />
                                        </Button>
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

            {/* Add User Modal */}
            <Modal open={isAddModalOpen} onClose={handleCloseModals}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        width: 400,
                    }}
                >
                    <Typography variant="h6" component="h2" mb={2}>
                        Add User
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="first_name"
                                value={addUserData.first_name || ''}
                                onChange={(e) =>
                                    setAddUserData((prev) => ({
                                        ...prev,
                                        first_name: e.target.value,
                                    }))
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="last_name"
                                value={addUserData.last_name || ''}
                                onChange={(e) =>
                                    setAddUserData((prev) => ({
                                        ...prev,
                                        last_name: e.target.value,
                                    }))
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={addUserData.email || ''}
                                onChange={(e) =>
                                    setAddUserData((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                name="password"
                                value={addUserData.password || ''}
                                onChange={(e) =>
                                    setAddUserData((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                    }))
                                }
                                required
                            />
                        </Grid>
                    </Grid>
                    <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" onClick={handleCloseModals}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleAddUserSubmit} disabled={addingUser}>
                            {addingUser ? <CircularProgress size={24} /> : 'Add User'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Edit User Modal */}
            <Modal open={isEditModalOpen} onClose={handleCloseModals}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        width: 400,
                    }}
                >
                    <Typography variant="h6" component="h2" mb={2}>
                        Edit User
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={editUserData.name || ''}
                                onChange={(e) =>
                                    setEditUserData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={editUserData.email || ''}
                                onChange={(e) =>
                                    setEditUserData((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Seller Type"
                                name="sellerType"
                                value={editUserData.sellerType || ''}
                                onChange={(e) =>
                                    setEditUserData((prev) => ({
                                        ...prev,
                                        sellerType: e.target.value,
                                    }))
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={editUserData.is_already_agent || false}
                                        onChange={(e) =>
                                            setEditUserData((prev) => ({
                                                ...prev,
                                                is_already_agent: e.target.checked,
                                            }))
                                        }
                                    />
                                }
                                label="Already Agent"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={editUserData.isVerified || false}
                                        onChange={(e) =>
                                            setEditUserData((prev) => ({
                                                ...prev,
                                                isVerified: e.target.checked,
                                            }))
                                        }
                                    />
                                }
                                label="Verified"
                            />
                        </Grid>
                    </Grid>
                    <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" onClick={handleCloseModals}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleEditUserSubmit} disabled={updateLoading}>
                            {updateLoading ? <CircularProgress size={24} /> : 'Save'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Subscription History Modal */}
            <Modal open={subHistoryModalOpen} onClose={() => setSubHistoryModalOpen(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        width: 600,
                    }}
                >
                    <Typography variant="h6" component="h2" mb={2}>
                        Subscription History
                    </Typography>
                    {subHistoryLoading ? (
                        <CircularProgress />
                    ) : subHistoryError ? (
                        <Typography color="error">{subHistoryError}</Typography>
                    ) : subHistory && subHistory.data && subHistory.data.length > 0 ? (
                        <Grid container spacing={2}>
                            {subHistory.data.map((entry: any, index: number) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Box
                                        p={2}
                                        sx={{
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            backgroundColor: '#f9f9f9',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body1" gutterBottom>
                                            <strong>Plan:</strong> {entry.planName}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Status:</strong> {entry.status}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Start Date:</strong> {new Date(entry.startedAt).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>End Date:</strong> {new Date(entry.expiredAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography>No subscription history found for this user.</Typography>
                    )}
                    <Box mt={3} display="flex" justifyContent="flex-end">
                        <Button variant="outlined" onClick={() => setSubHistoryModalOpen(false)}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default Users;
