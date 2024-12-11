import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleTheme, toggleSidebar } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import Dropdown from '../Dropdown';
import IconMenu from '../Icon/IconMenu';
import Swal from 'sweetalert2';

import IconSun from '../Icon/IconSun';
import IconMoon from '../Icon/IconMoon';
import IconLaptop from '../Icon/IconLaptop';

import IconUser from '../Icon/IconUser';
import IconLogout from '../Icon/IconLogout';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconCaretDown from '../Icon/IconCaretDown';
import { useAuth } from '../../context/AuthContext';
import { AiOutlineHome } from 'react-icons/ai';
import { MdSubscriptions } from 'react-icons/md';
import { useGetAdminDataByID } from '../../hooks/admin/useGetAdminDataByID';

const Header = () => {
    const { logout } = useAuth();
    const userId = localStorage.getItem('id') || ''; // Fetch user ID from localStorage
    const { adminData, loading, error } = useGetAdminDataByID(userId);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [location]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    const { t } = useTranslation();

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will be logged out of your account!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, log me out!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate('/login'); // Redirect to the login page
            }
        });
    };

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                        <Link to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-8 ltr:-ml-1 rtl:-mr-1 inline" src="/assets/images/logo.svg" alt="logo" />
                            <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5  font-semibold  align-middle hidden md:inline dark:text-white-light transition-all duration-300">ImmoWorld</span>
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                            onClick={() => {
                                dispatch(toggleSidebar());
                            }}
                        >
                            <IconMenu className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                        <div className="sm:ltr:mr-auto sm:rtl:ml-auto"></div>
                        <div>
                            {themeConfig.theme === 'light' ? (
                                <button
                                    className={`${
                                        themeConfig.theme === 'light' &&
                                        'flex items-center p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => {
                                        dispatch(toggleTheme('dark'));
                                    }}
                                >
                                    <IconSun />
                                </button>
                            ) : (
                                ''
                            )}
                            {themeConfig.theme === 'dark' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'dark' &&
                                        'flex items-center p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => {
                                        dispatch(toggleTheme('system'));
                                    }}
                                >
                                    <IconMoon />
                                </button>
                            )}
                            {themeConfig.theme === 'system' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'system' &&
                                        'flex items-center p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => {
                                        dispatch(toggleTheme('light'));
                                    }}
                                >
                                    <IconLaptop />
                                </button>
                            )}
                        </div>
                        <div className="dropdown shrink-0 flex">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative group block"
                                button={<img className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/user-profile.png" alt="userProfile" />}
                            >
                                <ul className="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
                                    <li>
                                        <div className="flex items-center px-4 py-4">
                                            <img className="rounded-md w-10 h-10 object-cover" src="/assets/images/user-profile.png" alt="userProfile" />
                                            {loading ? (
                                                <p>Loading...</p>
                                            ) : error ? (
                                                <p className="text-red-500">{error}</p>
                                            ) : (
                                                <div className="ltr:pl-4 rtl:pr-4 truncate">
                                                    <h4 className="text-base">{adminData?.name || 'N/A'}</h4>
                                                    <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                        {adminData?.email || 'N/A'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                    <li>
                                        <Link to="/profile" className="dark:hover:text-white">
                                            <IconUser className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                                            Profile
                                        </Link>
                                    </li>
                                    <li
                                        onClick={handleLogout}
                                        className="border-t cursor-pointer border-white-light dark:border-white-light/10 text-danger flex justify-start items-center text-start !p-3"
                                    >
                                        <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                                        Sign Out
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* horizontal menu */}
                <ul className="horizontal-menu hidden py-1.5 font-semibold px-6 lg:space-x-1.5 xl:space-x-8 rtl:space-x-reverse bg-white border-t border-[#ebedf2] dark:border-[#191e3a] dark:bg-black text-black dark:text-white-dark">
                    <NavLink to="/">
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <IconMenuDashboard className="shrink-0" />
                                    <span className="px-1">{t('dashboard')}</span>
                                </div>
                            </button>
                        </li>
                    </NavLink>
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <IconMenuDashboard className="shrink-0" />
                                <span className="px-1">{t('User Management')}</span>
                            </div>
                            <div className="right_arrow">
                                <IconCaretDown />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li>
                                <NavLink to="/roles">{t('Roles')}</NavLink>
                            </li>
                            <li>
                                <NavLink to="/permissions">{t('Permissions')}</NavLink>
                            </li>
                            <li>
                                <NavLink to="/users">{t('Users')}</NavLink>
                            </li>
                        </ul>
                    </li>
                    <NavLink to="/properties">
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <AiOutlineHome className="shrink-0" />
                                    <span className="px-1">{t('Properties')}</span>
                                </div>
                            </button>
                        </li>
                    </NavLink>
                    <NavLink to="/plans">
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <MdSubscriptions className="shrink-0" />
                                    <span className="px-1">{t('Plans')}</span>
                                </div>
                            </button>
                        </li>
                    </NavLink>
                    <NavLink to="/profile">
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <IconUser className="group-hover:!text-primary shrink-0" />
                                    <span className="px-1">{t('Profile Management')}</span>
                                </div>
                            </button>
                        </li>
                    </NavLink>
                </ul>
            </div>
        </header>
    );
};

export default Header;
