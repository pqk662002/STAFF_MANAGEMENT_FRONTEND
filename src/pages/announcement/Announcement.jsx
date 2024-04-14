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
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    InputLabel,
    InputLabelProps,
} from '@mui/material';
import axios from 'axios';
import styles from '../../components/datatable/datatable_user/datatable_user.module.css';
import ReactPaginate from 'react-paginate';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Announcement = () => {
    const [tableData, setTableData] = useState([]);
    const [perPage, setPerPage] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);
    const [numOfTotalPages, setNumOfTotalPages] = useState(0);

    const [open, setOpen] = useState(false);

    const loadAnnouncements = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken'); // Lấy accessToken từ AsyncStorage

            const response = await axios.get('http://localhost:5555/v1/announcement/get-all-announcements', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setTableData(response.data);
            console.log('aaa', response.data);
            setNumOfTotalPages(Math.ceil(response.data.length / perPage));
        } catch (error) {
            console.log(error.response.data);
        }
    };

    useEffect(() => {
        loadAnnouncements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected + 1);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [formData, setFormData] = useState({
        nameAnnouncement: '',
        startAt: '',
        note: '',
        listEmployee: '',
        department: '',
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
            await axios.post('http://localhost:5555/v1/announcement', formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            // Sau khi thêm mới, reset form và cập nhật dữ liệu
            setFormData({
                nameAnnouncement: '',
                startAt: '',
                note: '',
                listEmployee: '',
                department: '',
            });
            setOpen(false); // Ẩn form
            loadAnnouncements(); // Cập nhật dữ liệu
        } catch (error) {
            console.log(error.response.data);
        }
    };

    const indexOfLastAnnouncement = currentPage * perPage;
    const indexOfFirstAnnouncement = indexOfLastAnnouncement - perPage;
    const visibleAnnouncements = tableData?.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

    return (
        <div className="home">
            <Sidebar />
            <div className="homeContainer">
                <Navbar />
                <div className={styles.servicePage}>
                    <div className={styles.datatable}>
                        <div className={styles.datatableTitle}>
                            <b>Lịch Biểu</b>
                            <Button
                                style={{ borderRadius: 5, background: 'rgb(98, 192, 216)' }}
                                variant="contained"
                                onClick={handleClickOpen}
                            >
                                Thêm mới
                            </Button>
                        </div>

                        <Dialog open={open} onClose={handleClose}>
                            <DialogTitle>Thêm mới lịch họp</DialogTitle>
                            <DialogContent>
                                <form onSubmit={handleSubmit} style={{ width: '400px' }}>
                                    <div style={{ width: '100%', marginBottom: '30px' }}>
                                        <TextField
                                            label="Tên cuộc họp"
                                            type="text"
                                            name="nameAnnouncement"
                                            value={formData.nameAnnouncement || ''}
                                            onChange={handleChange}
                                            required
                                            fullWidth
                                        />
                                    </div>
                                    <div style={{ width: '100%', marginBottom: '30px', position: 'relative' }}>
                                        <TextField
                                            label="Ngày họp"
                                            type="date"
                                            name="startAt"
                                            value={formData.startAt || ''}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true, required: true }}
                                            required
                                            fullWidth
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
                                        />
                                    </div>
                                    <div style={{ width: '100%', marginBottom: '30px' }}>
                                        <TextField
                                            label="Nhân viên"
                                            type="text"
                                            name="listEmployee"
                                            value={formData.listEmployee || ''}
                                            onChange={handleChange}
                                            fullWidth
                                        />
                                    </div>
                                    <div style={{ width: '100%', marginBottom: '30px' }}>
                                        <TextField
                                            label="Phòng ban"
                                            type="text"
                                            name="department"
                                            value={formData.department || ''}
                                            onChange={handleChange}
                                            fullWidth
                                        />
                                    </div>
                                    <DialogActions>
                                        <Button onClick={handleClose} color="primary">
                                            Đóng
                                        </Button>
                                        <Button type="submit" onClick={handleSubmit} color="primary">
                                            Thêm mới
                                        </Button>
                                    </DialogActions>
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
                                            Ngày bắt đầu
                                        </TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>Ghi chú</TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>Nhân viên</TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>Phòng ban</TableCell>
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
                                                    {new Date(announcement.startAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className={styles.tableCell + ' text-center'}>
                                                    {announcement.note}
                                                </TableCell>
                                                <TableCell className={styles.tableCell + ' text-center'}>
                                                    {announcement.listEmployee.join(', ')}
                                                </TableCell>
                                                <TableCell className={styles.tableCell + ' text-center'}>
                                                    {announcement.department}
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
