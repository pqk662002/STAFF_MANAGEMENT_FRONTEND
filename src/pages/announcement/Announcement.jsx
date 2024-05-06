import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
} from '@mui/material';
import axios from 'axios';
import styles from '../../components/datatable/datatable_user/datatable_user.module.css';
import ReactPaginate from 'react-paginate';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import CustomSnackbar from '../../components/customSnackbar/CustomSnackbar';
import './Announcement.scss';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const Announcement = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [tableData, setTableData] = useState([]);
    const [perPage, setPerPage] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);
    const [numOfTotalPages, setNumOfTotalPages] = useState(0);
    const [departmentTitle, setDepartmentTitle] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [userPosition, setUserPosition] = useState('');
    const [editAnnouncement, setEditAnnouncement] = useState(null);
    const [actionType, setActionType] = useState('add');
    const [open, setOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    let [visibleAnnouncements, setVisibleAnnouncements] = useState([]);

    const handleSnackbarOpen = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const loadAnnouncements = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');

            const response = await axios.get('http://localhost:5555/v1/announcement/get-all-announcements', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log(response.data);
            setTableData(response.data);
            setNumOfTotalPages(Math.ceil(response.data.length / perPage));
        } catch (error) {
            console.log(error.response.data);
        }
    };

    const getUserInfo = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const decodedToken = jwtDecode(accessToken); // Giải mã accessToken để lấy thông tin user
            if (decodedToken && decodedToken.department) {
                const label = mapValueToLabel(decodedToken.department);
                setDepartmentTitle(`Lịch Biểu ${label}`); // Đặt title dựa trên phòng ban của user
            }
            setUserPosition(decodedToken.position);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const response = await axios.get('http://localhost:5555/v1/user/users/department', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    useEffect(() => {
        loadAnnouncements();
        getUserInfo();
        fetchEmployees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEmployeeChange = (event) => {
        const selected = event.target.value;
        setSelectedEmployees(selected);
        setFormData({
            ...formData,
            listEmployee: selected.join(', '),
        });
    };

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected + 1);
    };

    const handleClickOpen = (type, announcement = null) => {
        if (type === 'edit' && announcement) {
            setFormData({
                nameAnnouncement: announcement.nameAnnouncement || '',
                startAt: announcement.startAt || '',
                note: announcement.note || '',
                listEmployee: announcement.listEmployee || '',
            });
            setSelectedEmployees([]);
            setEditAnnouncement(announcement);
            setActionType('edit');
        } else if (type === 'view' && announcement) {
            setFormData({
                nameAnnouncement: announcement.nameAnnouncement || '',
                startAt: announcement.startAt || '',
                note: announcement.note || '',
                listEmployee: announcement.listEmployee ? announcement.listEmployee.join(', ') : '',
                department: announcement.department || '',
            });
            setSelectedEmployees(announcement.listEmployee || []);
            setEditAnnouncement(null);
            setActionType('view');
            setIsViewMode(true);
        } else {
            setFormData({
                nameAnnouncement: '',
                startAt: '',
                note: '',
                listEmployee: '',
                department: '',
            });
            setSelectedEmployees([]);
            setActionType('add');
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditAnnouncement(null);
        setActionType('add');
    };

    const [formData, setFormData] = useState({
        nameAnnouncement: '',
        startAt: '',
        note: '',
        listEmployee: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (actionType === 'add') {
                await axios.post('http://localhost:5555/v1/announcement', formData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            } else if (actionType === 'edit') {
                await axios.put(`http://localhost:5555/v1/announcement/${editAnnouncement._id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            }
            handleClose(); // Đóng dialog sau khi thêm mới hoặc cập nhật thành công
            loadAnnouncements();
            handleSnackbarOpen(actionType === 'add' ? 'Thêm mới thành công!' : 'Cập nhật thành công!', 'success');
        } catch (error) {
            console.log(error.response.data);
            handleSnackbarOpen('Đã có lỗi xảy ra. Vui lòng thử lại sau.', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken'); // Hoặc cách lấy token của bạn
            const response = await axios.delete(`http://localhost:5555/v1/announcement/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.status === 200) {
                setVisibleAnnouncements((prevAnnouncements) =>
                    prevAnnouncements.filter((announcement) => announcement._id !== id),
                );
                handleSnackbarOpen('Hoàn thành công việc!', 'success');
            }
            loadAnnouncements();
        } catch (error) {
            handleSnackbarOpen('Đã có lỗi xảy ra khi xóa announcement. Vui lòng thử lại sau.', 'error');
        }
    };

    const departments = [
        { value: '', label: 'Tất cả' },
        { value: 'BAN_QUAN_LY', label: 'Ban Quản lý' },
        { value: 'BAN_GIAM_DOC', label: 'Ban Giám Đốc' },
        { value: 'PHONG_NHAN_SU', label: 'Phòng Nhân Sự' },
        { value: 'PHONG_TAI_CHINH', label: 'Phòng Tài Chính' },
        { value: 'PHONG_MARKETING', label: 'Phòng Marketing' },
        { value: 'PHONG_KY_THUAT', label: 'Phòng Kỹ Thuật' },
        { value: 'PHONG_SAN_XUAT', label: 'Phòng Sản Xuất' },
        { value: 'PHONG_HANH_CHINH', label: 'Phòng Hành Chính' },
    ];

    const mapValueToLabel = (value) => {
        const department = departments.find((dept) => dept.value === value);
        return department ? department.label : '';
    };

    const indexOfLastAnnouncement = currentPage * perPage;
    const indexOfFirstAnnouncement = indexOfLastAnnouncement - perPage;
    visibleAnnouncements = tableData?.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

    return (
        <div className="home">
            <Sidebar />
            <CustomSnackbar
                open={openSnackbar}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
            <div className="homeContainer">
                <Navbar />
                <div className={styles.servicePage}>
                    <div className={styles.datatable}>
                        <div className={styles.datatableTitle}>
                            <b>{departmentTitle}</b>
                            {userPosition === 'TRUONG_PHONG' && (
                                <Button
                                    style={{ borderRadius: 5, background: 'rgb(98, 192, 216)' }}
                                    variant="contained"
                                    onClick={handleClickOpen}
                                >
                                    Thêm mới
                                </Button>
                            )}
                        </div>

                        <Dialog open={open} onClose={handleClose}>
                            <DialogTitle>
                                {actionType === 'add'
                                    ? 'Thêm mới lịch họp'
                                    : actionType === 'view'
                                    ? 'Xem chi tiết lịch họp'
                                    : 'Chỉnh sửa lịch họp'}
                            </DialogTitle>
                            <DialogContent>
                                <form onSubmit={handleSubmit} style={{ width: '450px' }}>
                                    <div style={{ width: '100%', marginBottom: '30px' }}>
                                        <TextField
                                            label="Tên cuộc họp"
                                            type="text"
                                            name="nameAnnouncement"
                                            value={formData.nameAnnouncement || ''}
                                            onChange={handleChange}
                                            required
                                            fullWidth
                                            InputProps={{
                                                readOnly: isViewMode,
                                            }}
                                        />
                                    </div>
                                    <div style={{ width: '100%', marginBottom: '30px', position: 'relative' }}>
                                        <TextField
                                            label="Thời gian họp"
                                            type="datetime-local"
                                            name="startAt"
                                            value={formData.startAt || ''}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true, required: true }}
                                            required
                                            fullWidth
                                            InputProps={{
                                                readOnly: isViewMode,
                                            }}
                                        />
                                    </div>
                                    <div style={{ width: '100%', marginBottom: '30px' }}>
                                        <TextField
                                            label="Ghi chú"
                                            type="text"
                                            name="note"
                                            value={formData.note || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            InputProps={{
                                                readOnly: isViewMode,
                                            }}
                                        />
                                    </div>
                                    <div style={{ width: '100%', marginBottom: '30px' }}>
                                        <InputLabel htmlFor="select-employees" style={{ marginBottom: '8px' }}>
                                            Nhân viên Tham Gia
                                        </InputLabel>
                                        <Select
                                            multiple
                                            value={selectedEmployees}
                                            onChange={handleEmployeeChange}
                                            renderValue={(selected) => selected.join(', ')}
                                            fullWidth
                                            style={{ width: '100%', borderRadius: '4px' }}
                                            id="select-employees"
                                            InputProps={{
                                                readOnly: isViewMode,
                                            }}
                                        >
                                            {employees.map((employee) => (
                                                <MenuItem
                                                    key={employee.id}
                                                    value={employee.fullname}
                                                    style={{ width: '100%' }}
                                                >
                                                    {employee.fullname}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </div>
                                    {actionType !== 'view' && (
                                        <DialogActions>
                                            <Button onClick={handleClose} color="primary">
                                                Đóng
                                            </Button>
                                            <Button type="submit" color="primary">
                                                {actionType === 'add' ? 'Thêm mới' : 'Cập nhật'}
                                            </Button>
                                        </DialogActions>
                                    )}
                                    {actionType === 'view' && (
                                        <DialogActions>
                                            <Button onClick={handleClose} color="primary">
                                                Đóng
                                            </Button>
                                        </DialogActions>
                                    )}
                                </form>
                            </DialogContent>
                        </Dialog>

                        <TableContainer component={Paper} className={styles.table}>
                            <Table sx={{ minWidth: 1200 }} aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={styles.tableCell + ' text-center'}>STT</TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            Tên thông báo
                                        </TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            Thời gian họp
                                        </TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>Ghi chú</TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>Nhân viên</TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>Lựa chọn</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {visibleAnnouncements?.length > 0 &&
                                        visibleAnnouncements?.map((announcement, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell className={styles.tableCell + ' text-center'}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className={styles.tableCell + ' text-center'}>
                                                    {announcement.nameAnnouncement}
                                                </TableCell>
                                                <TableCell className={styles.tableCell + ' text-center'}>
                                                    {new Date(announcement.startAt).toLocaleString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell
                                                    className={styles.tableCell + ' text-center'}
                                                    style={{ maxWidth: '200px' }}
                                                >
                                                    {announcement.note}
                                                </TableCell>
                                                <TableCell
                                                    className={styles.tableCell + ' text-center'}
                                                    style={{ maxWidth: '200px' }}
                                                >
                                                    {announcement.listEmployee.join(', ')}
                                                </TableCell>
                                                <TableCell className={styles.tableCell + ' text-center'}>
                                                    <div className={styles.cellAction}>
                                                        {userPosition !== 'TRUONG_PHONG' && (
                                                            <Button
                                                                className={styles.viewButton}
                                                                onClick={() => handleClickOpen('view', announcement)}
                                                            >
                                                                Xem chi tiết
                                                            </Button>
                                                        )}
                                                        {userPosition === 'TRUONG_PHONG' && (
                                                            <>
                                                                <Button
                                                                    className={styles.editButton}
                                                                    onClick={() =>
                                                                        handleClickOpen('edit', announcement)
                                                                    }
                                                                >
                                                                    Chỉnh sửa
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleDelete(announcement._id)}
                                                                    className={styles.deleteButton}
                                                                >
                                                                    Hoàn thành
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <ReactPaginate
                            previousLabel={'Prev'}
                            nextLabel={'Next'}
                            pageCount={numOfTotalPages}
                            onPageChange={handlePageChange}
                            containerClassName={styles.myContainerPagination}
                            pageClassName={styles.pageItem}
                            pageLinkClassName={styles.pageLink}
                            previousClassName={styles.pageItem}
                            previousLinkClassName={styles.pageLink}
                            nextClassName={styles.pageItem}
                            nextLinkClassName={styles.pageLink}
                            breakClassName={styles.pageItem}
                            breakLinkClassName={styles.pageLink}
                            activeClassName={styles.active}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcement;
