import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { FaEdit, FaTrashAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { usePropertyListing } from '../../hooks/usePropertyListing'; // Adjust import path if needed
import { useDeleteProperty } from '../../hooks/properties/useDeleteProperty'; // Adjust import path if needed

const Properties = (): JSX.Element => {
    const router = useNavigate();
    const { properties, loading, error, refetchProperties } = usePropertyListing();
    const { deleteProperty, loading: deleteLoading, error: deleteError, success, resetStates } = useDeleteProperty();
    const [openRow, setOpenRow] = useState<string | null>(null);

    const handleEditOpen = (property: any) => {
        router(`/properties/update/${property._id}`);
    };
    const handleDelete = async (id: string) => {
        const confirmDelete = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this property?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (confirmDelete.isConfirmed) {
            try {
                const message = await deleteProperty(id); // Execute delete function

                // Trigger the success modal and chain refetchProperties call
                await Swal.fire({
                    title: 'Deleted!',
                    text: message || 'The property has been deleted.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });

                // Refetch properties and reset states
                refetchProperties();
                resetStates();
            } catch (err) {
                console.error('Error during deletion:', err); // Debug log
                Swal.fire('Error!', deleteError || 'Failed to delete the property.', 'error');
            }
        }
    };

    const toggleRow = (propertyId: string) => {
        setOpenRow(openRow === propertyId ? null : propertyId);
    };

    if (loading) {
        return <div>Loading properties...</div>;
    }

    if (error) {
        return <div>Error fetching properties: {error}</div>;
    }

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex justify-between items-center mb-5">
                    <h5 className="font-semibold text-2xl dark:text-white-light ml-2">All Properties</h5>
                </div>

                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." />
                    </div>
                    <Link to={'/properties/add'}>
                        <button type="button" className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary">
                            Add New Property
                        </button>
                    </Link>
                </div>

                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={properties}
                        columns={[
                            { accessor: '_id', title: 'Property ID', sortable: true },
                            { accessor: 'ownerId', title: 'Owner ID', sortable: true },
                            { accessor: 'ownerType', title: 'Owner Type', sortable: true },
                            { accessor: 'title', title: 'Title', sortable: true },
                            { accessor: 'city.name', title: 'City', sortable: true },
                            { accessor: 'type', title: 'Type', sortable: true },
                            { accessor: 'price', title: 'Price', sortable: true },
                            { accessor: 'address', title: 'Address', sortable: true },
                            { accessor: 'availableFrom', title: 'Available From', sortable: true },
                            { accessor: 'status', title: 'Status', sortable: true },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (record) => (
                                    <div className="flex items-center justify-start">
                                        <Button onClick={() => handleEditOpen(record)} style={{ minWidth: 'auto' }}>
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(record._id)}
                                            style={{ minWidth: 'auto' }}
                                            disabled={deleteLoading} // Disable button while delete is in progress
                                        >
                                            <FaTrashAlt />
                                        </Button>
                                        <Button onClick={() => toggleRow(record._id)} style={{ minWidth: 'auto' }}>
                                            {openRow === record._id ? <FaChevronUp /> : <FaChevronDown />}
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        totalRecords={properties.length}
                        recordsPerPage={10}
                        page={1}
                        onPageChange={() => {}}
                        recordsPerPageOptions={[10, 20, 30, 50, 100]}
                        onRecordsPerPageChange={() => {}}
                        sortStatus={{ columnAccessor: '_id', direction: 'asc' }}
                        onSortStatusChange={() => {}}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />
                    {properties.map((property) =>
                        openRow === property._id ? (
                            <div key={property._id} className="py-5 mt-5 bg-white shadow-md rounded-lg px-6 border border-gray-200">
                                <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="text-gray-700">
                                        <span className="font-medium">Year Built:</span> {property.yearBuilt || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Size:</span> {property.size || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Latitude:</span> {property.latitude || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Longitude:</span> {property.longitude || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Basement:</span> {property.basement || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Roofing:</span> {property.roofing || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Amenities:</span> {property.amenities.join(', ') || 'N/A'}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-medium mb-2">Additional Details</h3>
                                    <p className="text-gray-700">{property.extraDetails || 'No additional details available.'}</p>
                                </div>
                            </div>
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
};

export default Properties;
