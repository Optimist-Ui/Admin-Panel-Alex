import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useGetCityById from '../../../hooks/countries/cities/useGetCityById';
import useUpdateCity from '../../../hooks/countries/cities/useUpdateCity';
import Swal from 'sweetalert2';

export type City = {
    _id: string;
    name: string;
    propertyCount: number;
    imageUrl: string | null;
    radius: number;
    countryId:
        | {
              code: string;
              name: string;
              _id: string;
          }
        | string; // Allow countryId to be either a string or an object
    createdAt: string;
    updatedAt: string;
};

const UpdateCity = () => {
    const { id } = useParams<{ id: string }>();
    const { getCityById, city, loading: fetching, error: fetchError } = useGetCityById();
    const { updateCity, loading: updating, error: updateError } = useUpdateCity();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) getCityById(id);
    }, [id, getCityById]);

    const formattedDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join(',');

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: city?._id || '',
            name: city?.name || '',
            propertyCount: city?.propertyCount || 0,
            imageUrl: city?.imageUrl || '',
            radius: city?.radius || 0,
            countryId: typeof city?.countryId === 'object' ? city?.countryId._id : city?.countryId || '', // Safely handle nested object or string
            createdAt: city?.createdAt || '',
            updatedAt: formattedDate,
        },
        validationSchema: Yup.object({
            name: Yup.string().required('City name is required'),
            radius: Yup.number().min(1, 'Radius must be greater than 0').required('Radius is required'),
        }),
        onSubmit: async (values) => {
            const isoUpdatedAt = new Date().toISOString();

            const formattedCity: City = {
                _id: values.id,
                name: values.name,
                propertyCount: values.propertyCount,
                imageUrl: values.imageUrl,
                radius: values.radius,
                countryId: values.countryId, // Only the ID is passed
                createdAt: values.createdAt,
                updatedAt: isoUpdatedAt,
            };
            console.log(formattedCity);

            const success = await updateCity(values.id, formattedCity);
            if (success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'City updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => navigate('/countries'));
            } else {
                console.log('Failed to update city');
            }
        },
    });

    if (fetching) return <p>Loading city details...</p>;
    if (fetchError) return <p>Error: {fetchError}</p>;

    return (
        <div className="panel p-4">
            <h1 className="text-2xl font-bold mb-6">Update City</h1>
            <form onSubmit={formik.handleSubmit}>
                <section className="shadow-sm p-4 py-10">
                    <h3 className="text-lg font-semibold text-gray-600 mb-5">City Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                                ID
                            </label>
                            <input id="id" className="form-input" name="id" type="text" value={formik.values.id} readOnly />
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                City Name
                            </label>
                            <input id="name" className="form-input" name="name" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.name} />
                            {formik.touched.name && formik.errors.name ? <div className="text-red-500 text-sm mt-2">{formik.errors.name}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
                                Radius
                            </label>
                            <input id="radius" className="form-input" name="radius" type="number" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.radius} />
                            {formik.touched.radius && formik.errors.radius ? <div className="text-red-500 text-sm mt-2">{formik.errors.radius}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="propertyCount" className="block text-sm font-medium text-gray-700">
                                Property Count
                            </label>
                            <input
                                id="propertyCount"
                                className="form-input"
                                name="propertyCount"
                                type="number"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.propertyCount}
                            />
                        </div>
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                                Image URL
                            </label>
                            <input id="imageUrl" className="form-input" name="imageUrl" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.imageUrl} />
                        </div>
                        <div>
                            <label htmlFor="countryId" className="block text-sm font-medium text-gray-700">
                                Country ID
                            </label>
                            <input id="countryId" className="form-input" name="countryId" type="text" value={formik.values.countryId} readOnly />
                        </div>
                        <div>
                            <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">
                                Created At
                            </label>
                            <input id="createdAt" className="form-input" name="createdAt" type="text" value={formik.values.createdAt} readOnly />
                        </div>
                        <div>
                            <label htmlFor="updatedAt" className="block text-sm font-medium text-gray-700">
                                Updated At
                            </label>
                            <input id="updatedAt" className="form-input" name="updatedAt" type="text" value={formik.values.updatedAt} readOnly />
                        </div>
                    </div>
                </section>
                <div className="flex justify-center items-center text-center py-6 mt-5 pb-8">
                    <button type="submit" className="btn btn-primary py-2 px-8 text-lg hover:bg-white hover:text-primary hover:border-primary" disabled={updating}>
                        {updating ? 'Updating...' : 'Update'}
                    </button>
                </div>
                {updateError && <p className="text-red-500 text-center mt-4">Error: {updateError}</p>}
            </form>
        </div>
    );
};

export default UpdateCity;
