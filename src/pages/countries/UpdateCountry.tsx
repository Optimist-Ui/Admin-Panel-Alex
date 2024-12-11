import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGetCountryById } from '../../hooks/countries/useGetCountryById';
import { useUpdateCountry } from '../../hooks/countries/useUpdateCountry';
import Swal from 'sweetalert2';

export type Country = {
    id: string;
    _id: string;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
    currency: string;
    isActive: boolean;
};

const UpdateCountry = () => {
    const { id } = useParams<{ id: string }>();
    const { getCountryById, country, loading: fetching, error: fetchError } = useGetCountryById();
    const { updateCountry, loading: updating, error: updateError } = useUpdateCountry();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) getCountryById(id);
    }, [id, getCountryById]);

    // Format today's date as MM,YY,DD for displaying
    const formattedDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join(',');

    const formik = useFormik({
        enableReinitialize: true, // Enables pre-filling of form fields with fetched data
        initialValues: {
            id: country?._id || '',
            country: country?.name || '',
            code: country?.code || '', // Country code
            currency: country?.currency || '', // Currency name
            createdAt: country?.createdAt || '', // Adding createdAt field
            updatedAt: formattedDate, // Set the updatedAt to today's date in MM,YY,DD format
            isActive: country?.isActive || false, // Boolean field for isActive
        },
        validationSchema: Yup.object({
            code: Yup.string().required('Country code is required'),
            currency: Yup.string().required('Currency is required'),
        }),
        onSubmit: async (values) => {
            // Convert the updatedAt field to ISO string before submitting
            const isoUpdatedAt = new Date().toISOString(); // ISO standard format

            // Formatting the data into the desired Country type
            const formattedCountry: Country = {
                id: values.id,
                _id: values.id,
                name: values.country,
                code: values.code,
                createdAt: values.createdAt,
                updatedAt: isoUpdatedAt, // Use the ISO string for updatedAt
                currency: values.currency,
                isActive: values.isActive,
            };

            const success = await updateCountry(values.id, formattedCountry);
            if (success) {
                // Show success alert
                Swal.fire({
                    title: 'Success!',
                    text: 'Country updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    // Redirect user to the countries page after success
                    navigate('/countries');
                });
            } else {
                // Handle failure (error is already set in the hook)
                console.log('Failed to update country');
            }
        },
    });

    if (fetching) return <p>Loading country details...</p>;
    if (fetchError) return <p>Error: {fetchError}</p>;

    return (
        <div className="panel p-4">
            <h1 className="text-2xl font-bold mb-6">Update Country</h1>
            <form onSubmit={formik.handleSubmit}>
                <section className="shadow-sm p-4 py-10">
                    <h3 className="text-lg font-semibold text-gray-600 mb-5">Country Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                                ID
                            </label>
                            <input id="id" className="form-input" name="id" type="text" value={formik.values.id} readOnly />
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                Country Name
                            </label>
                            <input id="country" className="form-input" name="country" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.country} />
                            {formik.touched.country && formik.errors.country ? <div className="text-red-500 text-sm mt-2">{formik.errors.country}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Country Code
                            </label>
                            <input id="code" className="form-input" name="code" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.code} />
                            {formik.touched.code && formik.errors.code ? <div className="text-red-500 text-sm mt-2">{formik.errors.code}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                Currency
                            </label>
                            <input id="currency" className="form-input" name="currency" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.currency} />
                            {formik.touched.currency && formik.errors.currency ? <div className="text-red-500 text-sm mt-2">{formik.errors.currency}</div> : null}
                        </div>

                        {/* Hidden Fields for createdAt, updatedAt, and ID */}

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
                        <div className="flex w-fit justify-center text-center items-center flex-row">
                            <input id="isActive" name="isActive" className="cursor-pointer mb-2 mx-2" type="checkbox" onChange={formik.handleChange} checked={formik.values.isActive} />
                            <label htmlFor="isActive" className="block cursor-pointer text-sm font-medium text-gray-700">
                                isActive
                            </label>
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

export default UpdateCountry;
