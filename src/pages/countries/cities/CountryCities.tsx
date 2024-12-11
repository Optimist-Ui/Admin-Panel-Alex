import React, { useEffect, useState } from 'react';
import { useGetCitiesByCountry } from '../../../hooks/countries/cities/useGetCitiesByCountry';
import { useDeleteCityById } from '../../../hooks/countries/cities/useDeleteCityById';
import { useAddCity } from '../../../hooks/countries/cities/useAddCity'; // Import the add city hook
import { Button, CircularProgress, Typography, Box, TextField, Modal, Grid } from '@mui/material';
import { DataTable } from 'mantine-datatable';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Formik, Form, Field } from 'formik';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
const CountryCities = () => {
    const [countryName, setCountryName] = useState<string>('');
    const [countryId, setCountryId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [openModal, setOpenModal] = useState(false); // To control modal open/close
    const [loading, setLoading] = useState(false); // To handle loading state for the form submission
    const { cities, loading: citiesLoading, error, refetchCities } = useGetCitiesByCountry(countryName);
    const { deleteCity, loading: deletingCity } = useDeleteCityById();
    const { addCity, loading: addingCity } = useAddCity(); // Hook to add city
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ID = urlParams.get('countryId');
        if (ID) setCountryId(ID);
        const country = urlParams.get('countryName');
        if (country) setCountryName(country);
    }, []);

    const filteredCities = cities ? cities.filter((city: any) => city.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];

    const paginatedCities = filteredCities.slice((page - 1) * pageSize, page * pageSize);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
        });

        if (result.isConfirmed) {
            const isDeleted = await deleteCity(id);
            if (isDeleted) {
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'The city has been deleted successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                refetchCities(); // Update the UI by refetching the city list
            } else {
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete the city.',
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                });
            }
        }
    };

    const handleModalOpen = () => {
        setOpenModal(true);
    };

    const handleModalClose = () => {
        setOpenModal(false);
    };

    const handleAddCity = async (values: any) => {
        setLoading(true);
        const isAdded = await addCity(values); // Call the API to add the city

        if (isAdded) {
            setLoading(false);
            handleModalClose();
            await Swal.fire({
                title: 'Success!',
                text: 'City has been added successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
            });
            refetchCities(); // Update the UI by refetching the city list
        } else {
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to add the city.',
                icon: 'error',
                confirmButtonText: 'Try Again',
            });
        }
    };

    return (
        <div className="panel mt-6 p-5">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-5">
                <Typography variant="h5" className="font-semibold text-2xl dark:text-white-light">
                    All Cities of {countryName}
                </Typography>
            </div>

            {/* Search Bar */}
            <div className="flex justify-end gap-2 items-start text-center mb-5">
                <TextField label="Search Cities" variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary" onClick={handleModalOpen}>
                    Add New City
                </button>
            </div>

            {/* DataTable Section */}
            <div className="datatables">
                {citiesLoading || deletingCity ? (
                    <Box display="flex" justifyContent="center" mt={3}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : filteredCities.length > 0 ? (
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={paginatedCities}
                        columns={[
                            { accessor: '_id', title: 'City ID', sortable: true },
                            { accessor: 'countryId', title: 'Country ID', sortable: true },
                            { accessor: 'name', title: 'City Name', sortable: true },
                            { accessor: 'radius', title: 'Radius', sortable: true },
                            { accessor: 'propertyCount', title: 'Properties ', sortable: true },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (record) => (
                                    <div className="flex justify-start items-center">
                                        <Button style={{ minWidth: 'auto' }} title="Edit" onClick={() => navigate(`/city/update/${record._id}`)}>
                                            <FaEdit />
                                        </Button>
                                        <Button style={{ minWidth: 'auto' }} onClick={() => handleDelete(record._id)}>
                                            <FaTrashAlt />
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={filteredCities.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={[5, 10, 15]}
                        onRecordsPerPageChange={setPageSize}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />
                ) : (
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Typography>No cities found for {countryName}.</Typography>
                    </Box>
                )}
            </div>

            {/* Modal for Adding City */}

            <Modal open={openModal} onClose={handleModalClose}>
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
                        Add New City
                    </Typography>
                    <Formik
                        initialValues={{
                            name: '',
                            radius: '',
                            countryId: `${countryId}`,
                            currentDate: format(new Date(), 'yyyy-MM-dd'), // Format current date
                        }}
                        validate={(values) => {
                            const errors: { [key: string]: string } = {};
                            if (!values.name) errors.name = 'City Name is required';
                            if (!values.radius) errors.radius = 'Radius is required';
                            return errors;
                        }}
                        onSubmit={handleAddCity}
                    >
                        {({ errors, touched, handleChange, values }) => (
                            <Form>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="City Name"
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
                                            label="Radius"
                                            name="radius"
                                            value={values.radius}
                                            onChange={handleChange}
                                            error={touched.radius && !!errors.radius}
                                            helperText={touched.radius && errors.radius}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Country ID"
                                            name="countryId"
                                            value={values.countryId}
                                            disabled // Disable the input
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Current Date"
                                            name="currentDate"
                                            value={values.currentDate}
                                            disabled // Display current date in a disabled input
                                        />
                                    </Grid>
                                </Grid>
                                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                                    <Button variant="outlined" onClick={handleModalClose}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" color="primary" type="submit" disabled={addingCity || loading}>
                                        {addingCity ? <CircularProgress size={24} /> : 'Add City'}
                                    </Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Modal>
        </div>
    );
};

export default CountryCities;
