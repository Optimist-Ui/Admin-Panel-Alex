import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useGetAdminDataByID } from '../../hooks/admin/useGetAdminDataByID';
import { useUpdateProfile } from '../../hooks/admin/useUpdateProfile';

const Profile: React.FC = () => {
    const userId = localStorage.getItem('id') || ''; // Fetch user ID from localStorage
    const { adminData, loading: fetchingData, error: fetchError } = useGetAdminDataByID(userId);
    const { updateProfile, loading: updating, error: updateError, successMessage } = useUpdateProfile();

    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        oldPassword: string;
        newPassword: string;
    }>({
        name: '',
        email: '',
        oldPassword: '',
        newPassword: '',
    });

    const [showPassword, setShowPassword] = useState<{
        oldPassword: boolean;
        newPassword: boolean;
    }>({
        oldPassword: false,
        newPassword: false,
    });

    // Populate form with fetched data
    useEffect(() => {
        if (adminData) {
            setFormData((prev) => ({
                ...prev,
                name: adminData.name,
                email: adminData.email,
            }));
        }
    }, [adminData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const updateData: { name: string; email: string; password?: string } = {
            name: formData.name,
            email: formData.email,
        };
        if (formData.newPassword) {
            updateData.password = formData.newPassword;
        }
        await updateProfile(userId, updateData);
    };

    const togglePasswordVisibility = (field: 'oldPassword' | 'newPassword') => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    useEffect(() => {
        if (successMessage) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                oldPassword: '',
                newPassword: '',
            }));
            window.location.reload();
        }
    }, [successMessage]);

    return (
        <div className="panel">
            {fetchingData ? (
                <p>Loading...</p>
            ) : fetchError ? (
                <p className="text-red-500">{fetchError}</p>
            ) : (
                <form onSubmit={handleSubmit} className="dark:border-[#191e3a] flex flex-col justify-start items-center rounded-md p-4 mb-5 bg-white dark:bg-black">
                    <div className="flex items-center flex-col justify-center text-center">
                        <img src="/assets/images/user-profile.png" alt="Profile" className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto" />
                        <div className="truncate">
                            <h4 className="text-base mt-1">{adminData?.name || 'N/A'}</h4>
                            <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                {adminData?.email || 'N/A'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-5 w-full">
                        <h6 className="text-lg font-bold mt-5">General Information</h6>

                        {/* Full Name */}
                        <div className="w-[50%]">
                            <label htmlFor="name" className="cursor-pointer">
                                Full Name
                            </label>
                            <input id="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} className="form-input" />
                        </div>

                        {/* Email */}
                        <div className="w-[50%]">
                            <label htmlFor="email" className="cursor-pointer">
                                Email
                            </label>
                            <input id="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="form-input" />
                        </div>

                        {/* Old Password */}
                        <div className="w-[50%] relative">
                            <label htmlFor="oldPassword" className="cursor-pointer">
                                Old Password
                            </label>
                            <input
                                id="oldPassword"
                                type={showPassword.oldPassword ? 'text' : 'password'}
                                placeholder="Old Password"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                className="form-input"
                            />
                            <button type="button" className="absolute right-4 top-[60%] transform text-gray-500" onClick={() => togglePasswordVisibility('oldPassword')}>
                                {showPassword.oldPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>

                        {/* New Password */}
                        <div className="w-[50%] relative">
                            <label htmlFor="newPassword" className="cursor-pointer">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type={showPassword.newPassword ? 'text' : 'password'}
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="form-input"
                            />
                            <button type="button" className="absolute right-4 top-[60%] transform text-gray-500" onClick={() => togglePasswordVisibility('newPassword')}>
                                {showPassword.newPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>

                        {/* Feedback Messages */}
                        {updateError && <p className="text-red-500 text-sm mb-2">{updateError}</p>}
                        {successMessage && <p className="text-green-500 text-sm mb-2">{successMessage}</p>}
                    </div>
                    {/* Save Button */}
                    <div className="w-[50%] flex items-center justify-center mt-5">
                        <button type="submit" className="btn btn-primary py-2 hover:bg-white px-12 hover:text-primary hover:border-primary" disabled={updating}>
                            {updating ? 'Updating...' : 'Save'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Profile;
