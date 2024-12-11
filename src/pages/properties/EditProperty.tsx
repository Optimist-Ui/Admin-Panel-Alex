import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProperty } from '../../hooks/properties/useUpdateProperty';
import { useGetPropertyById } from '../../hooks/properties/useGetPropertyByID';

// Define valid categories for validation
const validCategories = ['Apartments', 'Bungalow', 'Houses', 'Loft', 'Office', 'Townhome', 'Villa'];

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required').min(11, 'Description must be at least 11 characters long'),
    category: Yup.array()
        .of(Yup.string().required('Category is required'))
        .required('Category is required')
        .test('valid-category', `Allowed categories: ${validCategories.join(', ')}`, (value) => {
            if (value && Array.isArray(value)) {
                return value.every((category) => typeof category === 'string' && validCategories.includes(category));
            }
            return false;
        }),
    amenities: Yup.array().of(Yup.string().required('Each amenity must be a string')).optional(),
    status: Yup.string().required('Status is required').oneOf(['Pending', 'Active', 'Inactive']),
    type: Yup.string().required('Type is required').oneOf(['Rent', 'Sale']),
    price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
    address: Yup.string().required('Address is required'),
    latitude: Yup.number().required('Latitude is required'),
    longitude: Yup.number().required('Longitude is required'),
    size: Yup.number().min(0, 'Size must be positive').required('Size is required'),
    roomSize: Yup.number().min(0, 'Room size must be positive'),
    rooms: Yup.number().min(0, 'Number of rooms must be positive'),
    bedrooms: Yup.number().min(0, 'Number of bedrooms must be positive').required('Number of bedrooms is required'),
    bathrooms: Yup.number().min(0, 'Number of bathrooms must be positive').required('Number of bathrooms is required'),
    garages: Yup.number().min(0, 'Number of garages must be positive'),
    garageSize: Yup.number().min(0, 'Garage size must be positive'),
    yearBuilt: Yup.number().min(0, 'Year must be a valid number'),
    availableFrom: Yup.date().required('Available From date is required'),
    city: Yup.string().required('City is required'),
    ownerId: Yup.string().required('Owner ID is required'),
    ownerType: Yup.string().required('Owner type is required').oneOf(['user', 'agent']),
    isFeatured: Yup.boolean(),
    views: Yup.number().min(0, 'Views must be a positive number'),
});

const EditProperty = () => {
    const [images, setImages] = useState<{ src: string }[]>([]); // Local state for image previews
    const { propertyId } = useParams<{ propertyId: string }>();
    const navigate = useNavigate();

    // Fetch property details
    const { property, loading: fetchingProperty, error: fetchError } = useGetPropertyById(propertyId || '');
    const { updateProperty, loading: updating, error: updateError, success } = useUpdateProperty();

    // Formik configuration
    const formik = useFormik({
        initialValues: {
            title: property?.title || '',
            description: property?.description || '',
            category: property?.category || [],
            status: property?.status || '',
            price: property?.price || 0,
            type: property?.type || '',
            address: property?.address || '',
            latitude: property?.latitude || 0,
            longitude: property?.longitude || 0,
            size: property?.size || 0,
            roomSize: property?.roomSize || 0,
            rooms: property?.rooms || 0,
            bedrooms: property?.bedrooms || 0,
            bathrooms: property?.bathrooms || 0,
            garages: property?.garages || 0,
            garageSize: property?.garageSize || 0,
            yearBuilt: property?.yearBuilt || 0,
            availableFrom: property?.availableFrom ? property.availableFrom.split('T')[0] : '', // Convert to yyyy-MM-dd
            basement: property?.basement || '',
            extraDetails: property?.extraDetails || '',
            roofing: property?.roofing || '',
            exteriorMaterial: property?.exteriorMaterial || '',
            amenities: property?.amenities || [],
            gallery: property?.gallery || [],
            city: property?.city || '',
            ownerId: property?.ownerId || '',
            ownerType: property?.ownerType || '',
            isFeatured: property?.isFeatured || false,
            views: property?.views || 0,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            try {
                const propertyData = {
                    ...values,
                    gallery: images.length ? images : property?.gallery || [],
                    availableFrom: new Date(values.availableFrom).toISOString(),
                };

                const { success, data, error } = await updateProperty(propertyId || '', propertyData);

                if (success) {
                    Swal.fire({
                        title: 'Updated!',
                        text: 'The property has been successfully updated.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        navigate('/properties');
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: error || 'An unknown error occurred.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            } catch (err) {
                console.error('Error in onSubmit:', err);
            }
        },
    });

    // Handle file upload changes for gallery
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const previews = Array.from(files).map((file: File) => ({
                src: URL.createObjectURL(file),
            }));
            setImages(previews);
        }
    };

    // Render logic
    if (fetchingProperty) return <p>Loading property details...</p>;
    if (fetchError) return <p>Error loading property: {fetchError}</p>;
    if (!property) return <p>No property found.</p>;

    return (
        <div className="panel" id="custom_styles">
            <form onSubmit={formik.handleSubmit} className="space-y-5 mb-5">
                {/* General Information Section */}
                <section className="shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-600 mb-4">General Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input id="title" name="title" className="form-input" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.title} />
                            {formik.touched.title && formik.errors.title ? <div className="text-red-500 text-sm mt-2">{formik.errors.title}</div> : null}
                        </div>

                        <div>
                            <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700">
                                Owner ID
                            </label>
                            <input id="ownerId" name="ownerId" className="form-input" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.ownerId} />
                            {formik.touched.ownerId && formik.errors.ownerId ? <div className="text-red-500 text-sm mt-2">{formik.errors.ownerId}</div> : null}
                        </div>

                        <div>
                            <label htmlFor="ownerType" className="block text-sm font-medium text-gray-700">
                                Owner Type
                            </label>
                            <input id="ownerType" name="ownerType" className="form-input" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.ownerType} />
                            {formik.touched.ownerType && formik.errors.ownerType ? <div className="text-red-500 text-sm mt-2">{formik.errors.ownerType}</div> : null}
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                Price
                            </label>
                            <input id="price" className="form-input" name="price" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.price} />
                            {formik.touched.price && formik.errors.price ? <div className="text-red-500 text-sm mt-2">{formik.errors.price}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <input
                                id="category"
                                name="category"
                                type="text"
                                className="form-input"
                                onChange={(e) => {
                                    formik.setFieldValue('category', [e.target.value]); // Wrap the value in an array
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.category[0] || ''} // Display the first item in the array
                            />
                            {formik.touched.category && formik.errors.category ? <div className="text-red-500 text-sm mt-2">{formik.errors.category}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">
                                Amenities
                            </label>
                            <input
                                id="amenities"
                                className="form-input"
                                name="amenities"
                                type="text"
                                onChange={(e) => {
                                    // Convert the comma-separated string into an array of strings
                                    const amenitiesArray = e.target.value.split(',').map((item) => item.trim());
                                    formik.setFieldValue('amenities', amenitiesArray);
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.amenities.join(', ')} // Display the array as a comma-separated string
                            />
                            {formik.touched.amenities && formik.errors.amenities ? <div className="text-red-500 text-sm mt-2">{formik.errors.amenities}</div> : null}
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <input id="status" className="form-input" name="status" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.status} />
                            {formik.touched.status && formik.errors.status ? <div className="text-red-500 text-sm mt-2">{formik.errors.status}</div> : null}
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                Type
                            </label>
                            <input id="type" className="form-input" name="type" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.type} />
                            {formik.touched.type && formik.errors.type ? <div className="text-red-500 text-sm mt-2">{formik.errors.type}</div> : null}
                        </div>
                    </div>
                    <div className="my-12">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            className="form-input  w-[50%] h-[8rem] px-4 py-2"
                            name="description"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                        />
                        {formik.touched.description && formik.errors.description ? <div className="text-red-500 text-sm mt-2">{formik.errors.description}</div> : null}
                    </div>
                </section>

                {/* Location Details */}

                <section className="shadow-sm p-4 py-10">
                    <h3 className="text-lg font-semibold text-gray-600 mb-5">Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                City
                            </label>
                            <input id="city" className="form-input" name="city" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.city} />
                            {formik.touched.city && formik.errors.city ? (
                                <div className="text-red-500 text-sm mt-2">
                                    {formik.errors.city} {/* Displays error message */}
                                </div>
                            ) : null}
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <input id="address" className="form-input" name="address" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.address} />
                            {formik.touched.address && formik.errors.address ? <div className="text-red-500 text-sm mt-2">{formik.errors.address}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                                Latitude
                            </label>
                            <input id="latitude" className="form-input" name="latitude" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.latitude} />
                            {formik.touched.latitude && formik.errors.latitude ? <div className="text-red-500 text-sm mt-2">{formik.errors.latitude}</div> : null}
                        </div>

                        <div>
                            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                                Longitude
                            </label>
                            <input id="longitude" className="form-input" name="longitude" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.longitude} />
                            {formik.touched.longitude && formik.errors.longitude ? <div className="text-red-500 text-sm mt-2">{formik.errors.longitude}</div> : null}
                        </div>
                    </div>
                </section>

                {/* Additional Information */}

                <section className="shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-600 mb-10">Adittional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                                Size
                            </label>
                            <input id="size" className="form-input" name="size" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.size} />
                            {formik.touched.size && formik.errors.size ? <div className="text-red-500 text-sm mt-2">{formik.errors.size}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="rooms" className="block text-sm font-medium text-gray-700">
                                Rooms
                            </label>
                            <input id="rooms" className="form-input" name="rooms" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.rooms} />
                            {formik.touched.rooms && formik.errors.rooms ? <div className="text-red-500 text-sm mt-2">{formik.errors.rooms}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="roomSize" className="block text-sm font-medium text-gray-700">
                                Room Size
                            </label>
                            <input id="roomSize" className="form-input" name="roomSize" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.roomSize} />
                            {formik.touched.roomSize && formik.errors.roomSize ? <div className="text-red-500 text-sm mt-2">{formik.errors.roomSize}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                                Bedrooms
                            </label>
                            <input id="bedrooms" className="form-input" name="bedrooms" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.bedrooms} />
                            {formik.touched.bedrooms && formik.errors.bedrooms ? <div className="text-red-500 text-sm mt-2">{formik.errors.bedrooms}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                                Bathrooms
                            </label>
                            <input id="bathrooms" className="form-input" name="bathrooms" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.bathrooms} />
                            {formik.touched.bathrooms && formik.errors.bathrooms ? <div className="text-red-500 text-sm mt-2">{formik.errors.bathrooms}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="garages" className="block text-sm font-medium text-gray-700">
                                Garages
                            </label>
                            <input id="garages" className="form-input" name="garages" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.garages} />
                            {formik.touched.garages && formik.errors.garages ? <div className="text-red-500 text-sm mt-2">{formik.errors.garages}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="garageSize" className="block text-sm font-medium text-gray-700">
                                Garage Size
                            </label>
                            <input id="garageSize" className="form-input" name="garageSize" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.garageSize} />
                            {formik.touched.garageSize && formik.errors.garageSize ? <div className="text-red-500 text-sm mt-2">{formik.errors.garageSize}</div> : null}
                        </div>

                        <div>
                            <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700">
                                Year Built
                            </label>
                            <input id="yearBuilt" className="form-input" name="yearBuilt" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.yearBuilt} />
                            {formik.touched.yearBuilt && formik.errors.yearBuilt ? <div className="text-red-500 text-sm mt-2">{formik.errors.yearBuilt}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="roofing" className="block text-sm font-medium text-gray-700">
                                Roofing
                            </label>
                            <input id="roofing" className="form-input" name="roofing" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.roofing} />
                        </div>
                        <div>
                            <label htmlFor="basement" className="block text-sm font-medium text-gray-700">
                                Basement
                            </label>
                            <input id="basement" className="form-input" name="basement" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.basement} />
                        </div>
                        <div>
                            <label htmlFor="extraDetails" className="block text-sm font-medium text-gray-700">
                                Extra Details
                            </label>
                            <input
                                id="extraDetails"
                                className="form-input"
                                name="extraDetails"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.extraDetails}
                            />
                        </div>

                        <div>
                            <label htmlFor="exteriorMaterial" className="block text-sm font-medium text-gray-700">
                                Exterior Material
                            </label>
                            <input
                                id="exteriorMaterial"
                                className="form-input"
                                name="exteriorMaterial"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.exteriorMaterial}
                            />
                        </div>
                        <div>
                            <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700">
                                Available From
                            </label>
                            <input
                                id="availableFrom"
                                className="form-input"
                                name="availableFrom"
                                type="date"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.availableFrom}
                            />
                            {formik.touched.availableFrom && formik.errors.availableFrom ? <div className="text-red-500 text-sm mt-2">{formik.errors.availableFrom}</div> : null}
                        </div>
                        <div className="flex items-center mt-8 justify-start text-center gap-2 cursor-pointer ">
                            <input
                                id="isFeatured"
                                name="isFeatured"
                                className="-translate-y-1 w-4 h-4 gap-2 cursor-pointer"
                                type="checkbox"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                checked={formik.values.isFeatured}
                            />
                            <label htmlFor="isFeatured" className="block gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                Is Featured
                            </label>
                        </div>
                    </div>
                </section>

                {/* Upload Media Section */}

                <section className="shadow-sm p-4">
                    <div className="mb-5">
                        <label className="block mb-2 text-lg font-medium">Upload Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange} // File input change handler
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image.src} // Use the 'src' field here
                                            alt={`Preview ${index + 1}`}
                                            className="object-cover w-full h-32 rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Remove specific image from the list
                                                setImages(images.filter((_, i: number) => i !== index));
                                            }}
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                <div className="flex justify-center items-center text-center py-6 mt-5 pb-8">
                    <button type="submit" className="btn btn-primary py-2 px-8 text-lg hover:bg-white hover:text-primary hover:border-primary" disabled={updating}>
                        {updating ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProperty;
