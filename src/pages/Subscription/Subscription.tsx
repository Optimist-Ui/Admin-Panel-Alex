import React, { useState, useEffect } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useSubscriptionListing } from '../../hooks/useSubscriptions';
import { Subscription } from '../../hooks/useSubscriptions';
import { useDeleteSubscription } from '../../hooks/plans/useDeleteSubscription';
import { useUpdateSubscription } from '../../hooks/plans/useUpdateSubscription';
import { useAddSubscription } from '../../hooks/plans/useAddSubscription';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { Fade } from '@mui/material';

const PAGE_SIZES = [10, 20, 30, 50, 100];

const Subscriptions = (): JSX.Element => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Subscription Management'));
    }, [dispatch]);

    const { subscriptions, loading: subscriptionsLoading, error: subscriptionsError, refetchSubscriptions } = useSubscriptionListing();
    const { deleteSubscription, loading: deleteLoading, error: deleteError } = useDeleteSubscription();
    const { updateSubscription, loading: updateLoading, error: updateError } = useUpdateSubscription();
    const { addSubscription, loading: addLoading, error: addError } = useAddSubscription();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
    const [recordsData, setRecordsData] = useState<Subscription[]>([]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState<Partial<Subscription>>({});
    const [isEditMode, setIsEditMode] = useState(false);

    const handleModalClose = () => {
        setIsModalOpen(false);
        setCurrentSubscription({});
        setIsEditMode(false);
    };

    const handleAddOpen = () => {
        setIsModalOpen(true);
        setIsEditMode(false);
        setCurrentSubscription({});
    };

    const handleEditOpen = (subscription: Subscription) => {
        setIsModalOpen(true);
        setIsEditMode(true);
        setCurrentSubscription(subscription);
    };

    const handleModalSubmit = async () => {
        const { name, price, duration, description } = currentSubscription;

        if (!name || !price || !duration || !description) {
            Swal.fire('Error', 'All fields are required', 'error');
            return;
        }

        if (duration !== 'per month' && duration !== 'per year') {
            Swal.fire('Error', 'Duration must be either "per month" or "per year"', 'error');
            return;
        }

        if (isEditMode) {
            const success = await updateSubscription(currentSubscription.id as string, { name, price, duration, description });
            if (success) {
                Swal.fire('Success', 'Subscription updated successfully!', 'success');
                refetchSubscriptions();
            } else {
                Swal.fire('Error', updateError || 'Failed to update subscription.', 'error');
            }
        } else {
            const success = await addSubscription({ name, price, duration, description });
            if (success) {
                Swal.fire('Success', 'Subscription added successfully!', 'success');
                refetchSubscriptions();
            } else {
                Swal.fire('Error', addError || 'Failed to add subscription.', 'error');
            }
        }

        handleModalClose();
    };

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();
        const filtered = subscriptions.filter((subscription) => [subscription.id, subscription.name, subscription.status].join(' ').toLowerCase().includes(lowercasedSearch));
        setFilteredSubscriptions(filtered);
    }, [search, subscriptions]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData(filteredSubscriptions.slice(from, to));
    }, [page, pageSize, filteredSubscriptions]);

    const handleDelete = async (subscriptionId: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const success = await deleteSubscription(subscriptionId);
                if (success) {
                    Swal.fire('Deleted!', 'Subscription deleted successfully.', 'success');
                    refetchSubscriptions();
                } else {
                    Swal.fire('Error!', deleteError || 'Failed to delete subscription.', 'error');
                }
            }
        });
    };

    if (subscriptionsLoading) return <div>Loading...</div>;
    if (subscriptionsError) return <div>Error: {subscriptionsError}</div>;

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex justify-between items-center mb-5">
                    <h5 className="font-semibold text-2xl dark:text-white-light ml-2">All Plans</h5>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button variant="contained" color="primary" onClick={handleAddOpen} disabled={addLoading}>
                        Add New Subscription
                    </Button>
                </div>

                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={recordsData}
                        columns={[
                            { accessor: 'id', title: 'ID', sortable: true },
                            { accessor: 'name', title: 'Name', sortable: true },
                            { accessor: 'price', title: 'Price', sortable: true },
                            { accessor: 'duration', title: 'Duration', sortable: true },
                            { accessor: 'description', title: 'Description', render: (record) => record.description || 'N/A' },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (record) => (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center', // Vertically center the content
                                            justifyContent: 'start',
                                        }}
                                    >
                                        <Button
                                            onClick={() => handleEditOpen(record)}
                                            disabled={updateLoading}
                                            style={{ minWidth: 'auto' }} // Optional: Reduces button width
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(record.id)}
                                            disabled={deleteLoading}
                                            style={{ minWidth: 'auto' }} // Optional: Reduces button width
                                        >
                                            <FaTrashAlt />
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={filteredSubscriptions.length}
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

            <Modal open={isModalOpen} onClose={handleModalClose} closeAfterTransition>
                <Fade in={isModalOpen}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" mb={2}>
                            {isEditMode ? 'Edit Subscription' : 'Add Subscription'}
                        </Typography>
                        <TextField
                            fullWidth
                            label="Name"
                            value={currentSubscription.name || ''}
                            onChange={(e) => setCurrentSubscription({ ...currentSubscription, name: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={currentSubscription.price || ''}
                            onChange={(e) => setCurrentSubscription({ ...currentSubscription, price: parseFloat(e.target.value) })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Duration (e.g., per month or per year)"
                            placeholder="per month or per year"
                            value={currentSubscription.duration || ''}
                            onChange={(e) => setCurrentSubscription({ ...currentSubscription, duration: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            value={currentSubscription.description || ''}
                            onChange={(e) => setCurrentSubscription({ ...currentSubscription, description: e.target.value })}
                            margin="normal"
                        />
                        <Box mt={3} display="flex" justifyContent="space-between">
                            <Button variant="contained" color="primary" onClick={handleModalSubmit}>
                                {isEditMode ? 'Save Changes' : 'Add Subscription'}
                            </Button>
                            <Button variant="outlined" onClick={handleModalClose}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
};

export default Subscriptions;
