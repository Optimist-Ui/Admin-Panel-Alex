import { useState } from 'react';
import { useCountriesListing } from '../../hooks/countries/useCountriesListing';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { FaEdit, FaTrashAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { Modal, Box, Typography, Grid, TextField, FormControlLabel, Checkbox, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDeleteCountry } from '../../hooks/countries/useDeleteCountry';
import Swal from 'sweetalert2';
import { Formik, Field, Form, ErrorMessage } from 'formik';

// Define the Country type
type Country = {
    id: string;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
    currency: string;
    isActive: boolean;
    _id: string;
};

const Countries = () => {
    const { countries, loading, error, refetchCountries } = useCountriesListing();
    const { deleteCountry, loading: deleteLoading, error: deleteError } = useDeleteCountry();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [open, setOpen] = useState(false); // Modal state
    const initialValues: Country = {
        id: '',
        _id: '',
        name: '',
        code: '',
        createdAt: '', // default empty string or set a default date
        updatedAt: '', // default empty string or set a default date
        currency: '',
        isActive: false,
    };

    const navigate = useNavigate();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    // Handle form submission
    const handleSubmit = async (values: Country) => {
        console.log(values); // Show form data in the console

        // Show success alert using SweetAlert
        await Swal.fire({
            title: 'Success!',
            text: 'New country has been added successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
        });

        setOpen(false); // Close the modal
    };
    const onClose = () => {
        setOpen(false);
    };

    // Filter countries based on search input
    const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(search.toLowerCase()));

    // Handle delete country
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
        });

        if (result.isConfirmed) {
            const isDeleted = await deleteCountry(id);

            if (isDeleted) {
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'The country has been deleted successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                refetchCountries();
            } else {
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete the country.',
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                });
            }
        }
    };

    const formatDate = (isoDate: string): string => {
        const date = new Date(isoDate);
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options).replace(/,/g, '');
    };

    return (
        <div className="panel mt-6">
            <div className="flex justify-between items-center mb-5">
                <h5 className="font-semibold text-2xl dark:text-white-light ml-2">All Countries</h5>
            </div>
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-2">
                <div className="ltr:ml-auto rtl:mr-auto">
                    <TextField label="Search countries" variant="outlined" size="small" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary" onClick={() => setOpen(true)}>
                    Add New Country
                </button>
            </div>

            {/* Modal for Adding Country */}
            <Modal open={open} onClose={onClose}>
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
                        Add New Country
                    </Typography>
                    <Formik
                        initialValues={initialValues}
                        validate={(values) => {
                            const errors: Partial<Country> = {};
                            if (!values.name) errors.name = 'Name is required';
                            if (!values.code) errors.code = 'Code is required';
                            if (!values.currency) errors.currency = 'Currency is required';
                            return errors;
                        }}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched, handleChange, values }) => (
                            <Form>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Country Name"
                                            name="name"
                                            value={values.name}
                                            onChange={handleChange}
                                            error={touched.name && !!errors.name}
                                            helperText={touched.name && errors.name}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Country Code"
                                            name="code"
                                            value={values.code}
                                            onChange={handleChange}
                                            error={touched.code && !!errors.code}
                                            helperText={touched.code && errors.code}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Currency"
                                            name="currency"
                                            value={values.currency}
                                            onChange={handleChange}
                                            error={touched.currency && !!errors.currency}
                                            helperText={touched.currency && errors.currency}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Field name="isActive" type="checkbox" as={Checkbox} checked={values.isActive} onChange={handleChange} />} label="Is Active" />
                                    </Grid>
                                </Grid>
                                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                                    <Button variant="outlined" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" color="primary" type="submit" disabled={loading}>
                                        {loading ? <CircularProgress size={24} /> : 'Add Country'}
                                    </Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Modal>

            <div className="datatables">
                <DataTable
                    className="whitespace-nowrap table-hover"
                    records={filteredCountries}
                    columns={[
                        { accessor: 'id', title: 'ID', sortable: true },
                        { accessor: 'name', title: 'Country Name', sortable: true },
                        { accessor: 'code', title: 'Country Code', sortable: true },
                        { accessor: 'currency', title: 'Currency', sortable: true },
                        {
                            accessor: 'createdAt',
                            title: 'Created At',
                            sortable: true,
                            render: (record) => formatDate(record.createdAt),
                        },
                        {
                            accessor: 'updatedAt',
                            title: 'Updated At',
                            sortable: true,
                            render: (record) => formatDate(record.updatedAt),
                        },
                        {
                            accessor: 'isActive',
                            title: 'Is Active',
                            render: (record) => (record.isActive ? 'Yes' : 'No'),
                        },
                        {
                            accessor: 'actions',
                            title: 'Actions',
                            render: (record) => (
                                <div className="flex justify-start items-center">
                                    <Button style={{ minWidth: 'auto' }} title="Edit" onClick={() => navigate(`/countries/update/${record.id}`)} disabled={loading}>
                                        <FaEdit />
                                    </Button>
                                    <Button style={{ minWidth: 'auto' }} onClick={() => handleDelete(record.id)} disabled={deleteLoading}>
                                        <FaTrashAlt />
                                    </Button>
                                    <Button style={{ minWidth: 'auto' }} title="Check Cities" type="button" onClick={() => navigate(`/cities/?countryName=${record.name}&countryId=${record.id}`)}>
                                        <FaMapMarkerAlt />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    highlightOnHover
                    totalRecords={filteredCountries.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={[5, 10, 15]}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
        </div>
    );
};

export default Countries;
