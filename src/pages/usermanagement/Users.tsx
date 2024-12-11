import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Modal, Box, Button, TextField, Checkbox, FormControlLabel, CircularProgress, Grid, Typography } from '@mui/material';
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

    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<Partial<User>>({});
    const [isEditMode, setIsEditMode] = useState(false);

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

    const handleOpenModal = (user?: User): void => {
        setIsEditMode(!!user);
        setModalData(user || { name: '', email: '', sellerType: '', isAlreadyAgent: false, isVerified: false });
        setModalOpen(true);
    };

    const handleCloseModal = (): void => {
        setModalOpen(false);
        setModalData({});
    };

    const handleModalSubmit = async (): Promise<void> => {
        const { name, email, sellerType, isAlreadyAgent, isVerified } = modalData;
        if (!name || !email) {
            Swal.fire('Error', 'Name and Email are required', 'error');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            Swal.fire('Error', 'Invalid email format', 'error');
            return;
        }

        const success = isEditMode ? await updateUser(modalData.id!, { name, email, sellerType, isAlreadyAgent, isVerified }) : true; // Implement add user logic here.

        if (success) {
            Swal.fire('Success', isEditMode ? 'User updated successfully' : 'User added successfully', 'success');
            refetchUsers();
            handleCloseModal();
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
                    <button className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary" onClick={() => handleOpenModal()}>
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
                                    <div className="flex justify-start items-center">
                                        <Button style={{ minWidth: 'auto' }} onClick={() => handleOpenModal(record)} disabled={updateLoading}>
                                            <FaEdit />
                                        </Button>
                                        <Button style={{ minWidth: 'auto' }} onClick={() => handleDelete(record.id)} disabled={deleteLoading}>
                                            <FaTrashAlt />
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

            {/* Material-UI Modal for Add/Edit */}
            <Modal open={modalOpen} onClose={handleCloseModal}>
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
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Name" value={modalData.name} onChange={(e) => setModalData((prev) => ({ ...prev, name: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Email" value={modalData.email} onChange={(e) => setModalData((prev) => ({ ...prev, email: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Seller Type" value={modalData.sellerType} onChange={(e) => setModalData((prev) => ({ ...prev, sellerType: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox checked={modalData.isAlreadyAgent || false} onChange={(e) => setModalData((prev) => ({ ...prev, isAlreadyAgent: e.target.checked }))} />}
                                label="Already Agent"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={modalData.isVerified || false} onChange={(e) => setModalData((prev) => ({ ...prev, isVerified: e.target.checked }))} />}
                                label="Verified"
                            />
                        </Grid>
                    </Grid>
                    <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleModalSubmit} disabled={updateLoading}>
                            {updateLoading ? <CircularProgress size={24} /> : 'Save'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default Users;
