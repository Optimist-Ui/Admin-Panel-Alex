import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Permissions from './Permissions';

type User = {
    id: number;
    firstName: string;
    permissions: string;
    email: string;
    phone: string;
    role: string;
};

const rowData: User[] = [
    {
        id: 1,
        firstName: 'Caroline',
        permissions: 'CRUD',
        email: 'carolinejensen@zidant.com',
        phone: '+1 (821) 447-3782',
        role: 'Agent',
    },
    {
        id: 2,
        firstName: 'Celeste',
        permissions: 'CRUD',
        email: 'celestegrant@polarax.com',
        phone: '+1 (838) 515-3408',
        role: 'Agency',
    },
];

const Users = (): JSX.Element => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('User Management'));
    }, [dispatch]);

    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState('');
    const PAGE_SIZES: number[] = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<User[]>(sortBy(rowData, 'id'));
    const [recordsData, setRecordsData] = useState<User[]>(initialRecords);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });
    useEffect(() => {
        setInitialRecords(() => {
            return rowData.filter((item) => {
                return (
                    item.id.toString().includes(search.toLowerCase()) ||
                    item.firstName.toLowerCase().includes(search.toLowerCase()) ||
                    item.permissions.toLowerCase().includes(search.toLowerCase()) ||
                    item.role.toLowerCase().includes(search.toLowerCase()) ||
                    item.email.toLowerCase().includes(search.toLowerCase()) ||
                    item.phone.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    const handleEdit = (user: User): void => {
        Swal.fire({
            title: 'Edit User',
            html: `
                <div style="display: flex; color: #333; flex-direction: column; gap: 10px;">
                    <input id="swal-input1" class="swal2-input" placeholder="Name" value="${user.firstName}" autofocus required />
                    <input id="swal-input2" class="swal2-input" placeholder="Role" value="${user.role}" required />
                    <input id="swal-input3" class="swal2-input" placeholder="Permissions" value="${user.permissions}" required />
                    <input id="swal-input4" class="swal2-input" placeholder="Email" value="${user.email}" type="email" required />
                    <input id="swal-input5" class="swal2-input" placeholder="Phone" value="${user.phone}" type="tel" required />
                </div>
            `,
            confirmButtonText: 'Save',
            showCancelButton: true,
            preConfirm: () => {
                const firstName = (document.getElementById('swal-input1') as HTMLInputElement).value.trim();
                const role = (document.getElementById('swal-input2') as HTMLInputElement).value.trim();
                const permissions = (document.getElementById('swal-input3') as HTMLInputElement).value.trim();
                const email = (document.getElementById('swal-input4') as HTMLInputElement).value.trim();
                const phone = (document.getElementById('swal-input5') as HTMLInputElement).value.trim();

                if (!firstName || !permissions || !email || !phone || !role) {
                    Swal.showValidationMessage('All fields are required');
                    return;
                }

                if (!/^\S+@\S+\.\S+$/.test(email)) {
                    Swal.showValidationMessage('Invalid email format');
                    return;
                }

                return { id: user.id, firstName, permissions, email, phone, role };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedRecords = initialRecords.map((item) => (item.id === user.id ? result.value : item));
                setInitialRecords(updatedRecords);
                Swal.fire('Success', 'User updated successfully!', 'success');
            }
        });
    };

    const handleAdd = (): void => {
        Swal.fire({
            title: 'Add New User',
            html: `
                <div style="display: flex; color: #333; flex-direction: column; gap: 10px;">
                    <input id="swal-input1" class="swal2-input" placeholder="Name" autofocus required />
                    <input id="swal-input2" class="swal2-input" placeholder="Role" required />
                    <input id="swal-input3" class="swal2-input" placeholder="Permissions" required />
                    <input id="swal-input4" class="swal2-input" placeholder="Email" type="email" required />
                    <input id="swal-input5" class="swal2-input" placeholder="Phone" type="tel" required />
                </div>
            `,
            confirmButtonText: 'Add',
            showCancelButton: true,
            preConfirm: () => {
                const firstName = (document.getElementById('swal-input1') as HTMLInputElement).value.trim();
                const permissions = (document.getElementById('swal-input2') as HTMLInputElement).value.trim();
                const role = (document.getElementById('swal-input2') as HTMLInputElement).value.trim();
                const email = (document.getElementById('swal-input3') as HTMLInputElement).value.trim();
                const phone = (document.getElementById('swal-input4') as HTMLInputElement).value.trim();

                if (!firstName || !permissions || !email || !phone || !role) {
                    Swal.showValidationMessage('All fields are required');
                    return;
                }

                if (!/^\S+@\S+\.\S+$/.test(email)) {
                    Swal.showValidationMessage('Invalid email format');
                    return;
                }

                return { id: Date.now(), firstName, permissions, email, phone, role };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setInitialRecords([...initialRecords, result.value]);
                Swal.fire('Success', 'User added successfully!', 'success');
            }
        });
    };

    const handleDelete = (userId: number): void => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedRecords = initialRecords.filter((item) => item.id !== userId);
                setInitialRecords(updatedRecords);
                Swal.fire('Deleted!', 'User has been removed successfully.', 'success');
            }
        });
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex justify-between items-center mb-5">
                    <h5 className="font-semibold text-2xl dark:text-white-light ml-2">All Users</h5>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-primary py-2 hover:bg-white hover:text-primary hover:border-primary" onClick={handleAdd}>
                        Add New User
                    </button>
                </div>

                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={recordsData}
                        columns={[
                            { accessor: 'id', sortable: true },
                            { accessor: 'firstName', sortable: true },
                            { accessor: 'role', sortable: true },
                            { accessor: 'permissions', sortable: true },
                            { accessor: 'email', sortable: true },
                            { accessor: 'phone', title: 'Phone No.', sortable: true },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (record) => (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(record)}>
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(record.id)}>
                                            <FaTrashAlt style={{}} />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default Users;
