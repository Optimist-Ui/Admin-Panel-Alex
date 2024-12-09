import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrashAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Button, TextField, Dialog, Stepper, Step, StepLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePropertyListing } from '../../hooks/usePropertyListing';
import { useDeleteProperty } from '../../hooks/properties/useDeleteProperty';
import { useUpdateProperty } from '../../hooks/properties/useUpdateProperty';

export interface Property {
    _id: string;
    title: string;
    description: string;
    category: string[];
    status: string;
    price: number;
    type: string;
    address: string;
    latitude: number;
    longitude: number;
    size: number;
    roomSize: number;
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    garages: number;
    garageSize: number;
    yearBuilt: number;
    availableFrom: string;
    basement: string;
    extraDetails: string;
    roofing: string;
    exteriorMaterial: string;
    amenities: string[];
    gallery: { src: string; alt: string; _id: string }[];
    city: string;
    ownerId: string;
    ownerType: string;
    isFeatured: boolean;
    views: number;
}

const PAGE_SIZES = [10, 20, 30, 50, 100];

const Properties = (): JSX.Element => {
    const router = useNavigate();
    const { properties, loading, error, refetchProperties } = usePropertyListing();
    const { deleteProperty, success: deleteSuccess, resetStates: resetDeleteStates } = useDeleteProperty();
    const { updateProperty, success: updateSuccess, loading: updateLoading, resetStates: resetUpdateStates } = useUpdateProperty();

    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [recordsData, setRecordsData] = useState<Property[]>([]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: '_id',
        direction: 'asc',
    });

    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [currentEditProperty, setCurrentEditProperty] = useState<Property | null>(null);
    const [activeStep, setActiveStep] = useState<number>(0);

    const [openRow, setOpenRow] = useState<string | null>(null);

    useEffect(() => {
        if (search) {
            const lowercasedSearch = search.toLowerCase();
            const filtered = properties.filter((property) =>
                [property._id, property.title, property.address, property.type, property.price, property.status].join(' ').toLowerCase().includes(lowercasedSearch)
            );
            setFilteredProperties(filtered);
        } else {
            setFilteredProperties(properties);
        }
    }, [search, properties]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData(filteredProperties.slice(from, to));
    }, [page, pageSize, filteredProperties]);

    const handleEditOpen = (property: Property) => {
        setCurrentEditProperty(property);
        setActiveStep(0);
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setCurrentEditProperty(null);
    };

    const handleEditSave = async () => {
        if (currentEditProperty) {
            try {
                const updateData = {
                    title: currentEditProperty.title,
                    description: currentEditProperty.description,
                    ownerId: currentEditProperty.ownerId,
                    ownerType: currentEditProperty.ownerType,
                    category: currentEditProperty.category,
                    status: currentEditProperty.status,
                    price: currentEditProperty.price,
                    address: currentEditProperty.address,
                    city: currentEditProperty.city,
                    type: currentEditProperty.type,
                    latitude: currentEditProperty.latitude,
                    longitude: currentEditProperty.longitude,
                    size: currentEditProperty.size,
                    bedrooms: currentEditProperty.bedrooms,
                    bathrooms: currentEditProperty.bathrooms,
                    gallery: currentEditProperty.gallery.map((image) => ({ src: image.src })),
                };

                const updatedProperty = await updateProperty(currentEditProperty._id, updateData);

                setFilteredProperties((prev) => prev.map((property) => (property._id === updatedProperty._id ? updatedProperty : property)));

                Swal.fire('Updated!', 'Property details have been updated.', 'success');
            } catch (error) {
                Swal.fire('Error!', 'Failed to update the property.', 'error');
            } finally {
                handleEditClose();
                resetUpdateStates();
            }
        }
    };

    const toggleRow = (propertyId: string) => {
        setOpenRow(openRow === propertyId ? null : propertyId);
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
                await deleteProperty(id);
                setFilteredProperties((prev) => prev.filter((property) => property._id !== id));
                refetchProperties();
                Swal.fire('Deleted!', 'The property has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete the property.', 'error');
            } finally {
                resetDeleteStates();
            }
        }
    };

    const steps = ['Basic Information', 'Address Details', 'Property Details', 'Construction & Features'];

    const renderStepContent = (step: number) => {
        if (!currentEditProperty) return null;

        const handleFieldChange = (field: keyof Property, value: string | number) => {
            setCurrentEditProperty((prev) => prev && { ...prev, [field]: value });
        };

        switch (step) {
            case 0:
                return (
                    <>
                        <TextField label="Title" fullWidth value={currentEditProperty.title} onChange={(e) => handleFieldChange('title', e.target.value)} margin="normal" />
                        <TextField label="Type" fullWidth value={currentEditProperty.type} onChange={(e) => handleFieldChange('type', e.target.value)} margin="normal" />
                        <TextField label="Price" type="number" fullWidth value={currentEditProperty.price} onChange={(e) => handleFieldChange('price', Number(e.target.value))} margin="normal" />
                        <TextField label="Status" fullWidth value={currentEditProperty.status} onChange={(e) => handleFieldChange('status', e.target.value)} margin="normal" />
                    </>
                );
            case 1:
                return (
                    <>
                        <TextField label="Address" fullWidth value={currentEditProperty.address} onChange={(e) => handleFieldChange('address', e.target.value)} margin="normal" />
                        <TextField label="City" fullWidth value={currentEditProperty.city} onChange={(e) => handleFieldChange('city', e.target.value)} margin="normal" />
                        <TextField
                            label="Latitude"
                            type="number"
                            fullWidth
                            value={currentEditProperty.latitude}
                            onChange={(e) => handleFieldChange('latitude', Number(e.target.value))}
                            margin="normal"
                        />
                        <TextField
                            label="Longitude"
                            type="number"
                            fullWidth
                            value={currentEditProperty.longitude}
                            onChange={(e) => handleFieldChange('longitude', Number(e.target.value))}
                            margin="normal"
                        />
                        <TextField
                            label="Available From"
                            fullWidth
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={currentEditProperty.availableFrom}
                            onChange={(e) => handleFieldChange('availableFrom', e.target.value)}
                            margin="normal"
                        />
                    </>
                );
            case 2:
                return (
                    <>
                        <TextField label="Size" type="number" fullWidth value={currentEditProperty.size} onChange={(e) => handleFieldChange('size', Number(e.target.value))} margin="normal" />
                        <TextField
                            label="Room Size"
                            type="number"
                            fullWidth
                            value={currentEditProperty.roomSize}
                            onChange={(e) => handleFieldChange('roomSize', Number(e.target.value))}
                            margin="normal"
                        />
                        <TextField label="Rooms" type="number" fullWidth value={currentEditProperty.rooms} onChange={(e) => handleFieldChange('rooms', Number(e.target.value))} margin="normal" />
                        <TextField
                            label="Bedrooms"
                            type="number"
                            fullWidth
                            value={currentEditProperty.bedrooms}
                            onChange={(e) => handleFieldChange('bedrooms', Number(e.target.value))}
                            margin="normal"
                        />
                        <TextField
                            label="Bathrooms"
                            type="number"
                            fullWidth
                            value={currentEditProperty.bathrooms}
                            onChange={(e) => handleFieldChange('bathrooms', Number(e.target.value))}
                            margin="normal"
                        />
                        <TextField label="Garages" type="number" fullWidth value={currentEditProperty.garages} onChange={(e) => handleFieldChange('garages', Number(e.target.value))} margin="normal" />
                        <TextField
                            label="Garage Size"
                            type="number"
                            fullWidth
                            value={currentEditProperty.garageSize}
                            onChange={(e) => handleFieldChange('garageSize', Number(e.target.value))}
                            margin="normal"
                        />
                    </>
                );
            case 3:
                return (
                    <>
                        <TextField
                            label="Year Built"
                            type="number"
                            fullWidth
                            value={currentEditProperty.yearBuilt}
                            onChange={(e) => handleFieldChange('yearBuilt', Number(e.target.value))}
                            margin="normal"
                        />
                        <TextField label="Basement" fullWidth value={currentEditProperty.basement} onChange={(e) => handleFieldChange('basement', e.target.value)} margin="normal" />
                        <TextField label="Roofing" fullWidth value={currentEditProperty.roofing} onChange={(e) => handleFieldChange('roofing', e.target.value)} margin="normal" />
                        <TextField
                            label="Exterior Material"
                            fullWidth
                            value={currentEditProperty.exteriorMaterial}
                            onChange={(e) => handleFieldChange('exteriorMaterial', e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            label="Extra Details"
                            multiline
                            rows={4}
                            fullWidth
                            value={currentEditProperty.extraDetails}
                            onChange={(e) => handleFieldChange('extraDetails', e.target.value)}
                            margin="normal"
                        />
                    </>
                );
            default:
                return null;
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex justify-between items-center mb-5">
                    <h5 className="font-semibold text-2xl dark:text-white-light ml-2">All Properties</h5>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary" onClick={() => router('/properties/add')}>
                        Add New Property
                    </button>
                </div>

                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={recordsData}
                        columns={[
                            { accessor: '_id', title: 'Property ID', sortable: true },
                            { accessor: 'ownerId', title: 'Owner ID', sortable: true },
                            { accessor: 'ownerType', title: 'Owner Type', sortable: true },
                            { accessor: 'title', title: 'Title', sortable: true },
                            { accessor: 'city', title: 'City', sortable: true },
                            { accessor: 'type', title: 'Type', sortable: true },
                            { accessor: 'price', title: 'Price', sortable: true },
                            { accessor: 'address', title: 'Address', sortable: true },
                            { accessor: 'availableFrom', title: 'Available From', sortable: true },
                            { accessor: 'status', title: 'Status', sortable: true },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (record) => (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditOpen(record)}>
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(record._id)}>
                                            <FaTrashAlt />
                                        </button>
                                        <button onClick={() => toggleRow(record._id)}>{openRow === record._id ? <FaChevronUp /> : <FaChevronDown />}</button>
                                    </div>
                                ),
                            },
                        ]}
                        totalRecords={filteredProperties.length}
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
                    {filteredProperties.map((property) =>
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
                                        <span className="font-medium">Amenities:</span> {property.amenities || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Rooms:</span> {property.rooms || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Room Size:</span> {property.roomSize || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Bathrooms:</span> {property.bathrooms || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Bedrooms:</span> {property.bedrooms || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Garages:</span> {property.garages || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Garage Size:</span> {property.garageSize || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-medium">Exterior Material:</span> {property.exteriorMaterial || 'N/A'}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-medium mb-2">Additional Details</h3>
                                    <p className="text-gray-700">{property.extraDetails || 'No additional details available.'}</p>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-lg font-medium mb-2">Description</h3>
                                    <p className="text-gray-700">{property.description || 'No description available.'}</p>
                                </div>
                            </div>
                        ) : null
                    )}
                </div>
            </div>

            <Dialog open={editDialogOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
                <div style={{ padding: '20px' }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <div>{renderStepContent(activeStep)}</div>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button variant="contained" onClick={handleEditSave} disabled={updateLoading}>
                                {updateLoading ? 'Saving...' : 'Save'}
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={() => setActiveStep((prev) => prev + 1)}>
                                Next
                            </Button>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Properties;
