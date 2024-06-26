import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './datatable_request.module.css';
import Button from 'react-bootstrap/Button';
import ReactPaginate from 'react-paginate';
import queryString from 'query-string';
import { format } from 'date-fns';
const Datatable_request = () => {
    const location = useLocation();
    const params = queryString.parse(location.search);
    const [username, setUsername] = useState(() => {
        return params.username;
    });
    const [position, setPosition] = useState(() => {
        return params.position;
    });

    const [department, setDepartment] = useState('');
    const [selectedPosition, setSelectedPosition] = useState({ value: '', label: 'Tất cả' });

    const [selectedDepartment, setSelectedDepartment] = useState({ value: '', label: 'Tất cả' });
    const departments = [
        { value: '', label: 'Tất cả' },
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
    const [email, setEmail] = useState(() => {
        return params.email;
    });
    const [tableDataSVT, setTableDataSVT] = useState([]);
    const [departmentHead, setDepartmentHead] = useState('');
    //Pagination
    const [svtPerPage, setSvtPerPage] = useState(6);
    const [CsvtPerPage, setCSvtPerPage] = useState(1);
    const numOfToTalPages = Math.ceil(tableDataSVT?.length / svtPerPage);
    const indexOfLastSVT = CsvtPerPage * svtPerPage;
    const indexOfFirstSVT = indexOfLastSVT - svtPerPage;
    const visibleSVT = tableDataSVT?.slice(indexOfFirstSVT, indexOfLastSVT);

    const navigate = useNavigate();
    const changePage = ({ selected }) => {
        setCSvtPerPage(selected + 1);
    };

    useEffect(() => {
        async function checkAuth() {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                const decodedToken = jwtDecode(accessToken);
                setDepartmentHead(decodedToken.position);
                setDepartment(decodedToken.department);
                let curTime = Date.now() / 1000;
                if (decodedToken.exp < curTime) {
                    window.location.replace('/login');
                }
            } catch (error) {
                console.log('lỗi cmnr');
            }
        }
        checkAuth();
        loadSVT();
    }, []);

    function buildSearchURL() {
        const searchData = {
            usernameSearch: username || '',
            emailSearch: email || '',
            position: position || '',
            department: department || '',
        };

        let url = `http://localhost:5555/v1/request/?`;
        //check department
        url = url + `department=${searchData.department}`;
        // //check username
        // if (searchData.usernameSearch !== undefined && searchData.usernameSearch !== 'undefined') {
        //     url = url + `username=${searchData.usernameSearch}`;
        // } else {
        //     url = url + `username=`;
        //     setUsername('');
        // }

        // //check email
        // if (searchData.emailSearch !== undefined && searchData.emailSearch !== 'undefined') {
        //     url = url + `&email=${searchData.emailSearch}`;
        // } else {
        //     url = url + `&email=`;
        //     setEmail('');
        // }
        // //check position
        // url = url + `&position=${searchData.position}`;

        return url;
    }

    const getMultitaskDetail = async (id) => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log(id);
        let url = `http://localhost:5555/v1/multiTask/byrequest/${id}`;
        console.log(url);
        axios
            .get(url, { headers: { Authorization: `Bearer ${accessToken}` } })
            .then((response) => {
                // navigate(`/multiTask/${response.data.id}`);
                console.log(response.data);
                const multiTaskId = response.data._id;
                navigate(`/multiTask/${multiTaskId}`);
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const loadSVT = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const decodedToken = jwtDecode(accessToken);
        console.log(decodedToken);
        let url = `http://localhost:5555/v1/request/?`;
        //check department
        url = url + `department=${decodedToken.department}`;
        url = url + `&userid=${decodedToken.id}`;
        // const url = buildSearchURL();
        console.log(url);
        axios
            .get(url, { headers: { Authorization: `Bearer ${accessToken}` } })
            .then((response) => {
                console.log(response.data);
                setTableDataSVT(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
        //}
    };

    function search() {
        window.location.replace(
            `/users?username=${username}&email=${email}&position=${selectedPosition.value}&department=${selectedDepartment.value}`,
        );
    }

    function approveRequest(id) {
        navigate(`/multiTask/add/${id}`);
    }

    function addNewRequest(id) {
        navigate(`/requests/add`);
    }

    // useEffect(() => {
    //     async function checkAuth() {
    //         try {
    //             const accessToken = await AsyncStorage.getItem('accessToken');
    //             const decodedToken = jwtDecode(accessToken);
    //             setIsAdmin(decodedToken.isAdmin);
    //             setDepartment(decodedToken.department);
    //             let curTime = Date.now() / 1000;
    //             if (decodedToken.exp < curTime) {
    //                 window.location.replace('/login');
    //             }
    //         } catch (error) {
    //             console.log('lỗi cmnr');
    //         }
    //     }
    //     checkAuth();
    //     loadSVT();
    // }, []);

    const declineRequest = async (id) => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log(id);
        const temp = 'temp';
        axios
            .put(`http://localhost:5555/v1/request/decline/${id}`, temp, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            .then((response) => {
                window.location.replace(`/requests`);
            })
            .catch((error) => {
                window.alert("You don't have the permission to fulfill this action");
            });
        loadSVT();
    };

    return (
        <div className={styles.servicePage}>
            <div className={styles.datatable}>
                <div className={styles.datatableTitle}>
                    <b>Danh Sách Yêu Cầu</b>
                </div>

                <div style={{ marginBottom: 10 }}>
                    <Button
                        onClick={() => addNewRequest()}
                        style={{ background: 'green', fontSize: 15, fontWeight: 'bold' }}
                    >
                        Thêm Yêu Cầu
                    </Button>
                </div>

                <TableContainer component={Paper} className={styles.table}>
                    <Table sx={{ minWidth: 1200 }} aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell className={styles.tableCell + ' text-center'}>STT</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Tiêu đề</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Ngày Tạo</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Phòng Ban</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Trạng Thái</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Lựa Chọn</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleSVT?.length > 0 &&
                                visibleSVT?.map((item, index) => (
                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell className={styles.tableCell + ' text-center'}>{index + 1}</TableCell>

                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            {item.title}
                                        </TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            {format(item.createdAt, 'MM/dd/yyyy kk:mm:ss')}
                                        </TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            {mapValueToLabel(item.department)}
                                        </TableCell>
                                        {item.isApproved == 'Approved' ? (
                                            <TableCell
                                                className={styles.tableCell + ' text-center'}
                                                style={{ color: 'green', fontWeight: 'bold' }}
                                            >
                                                {item.isApproved}
                                            </TableCell>
                                        ) : (
                                            <TableCell className={styles.tableCell + ' text-center'}>
                                                {item.isApproved}
                                            </TableCell>
                                        )}

                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            {item.isApproved == 'Pending' &&
                                            department === 'BAN_GIAM_DOC' &&
                                            departmentHead === 'TRUONG_PHONG' ? (
                                                <div className={styles.cellAction}>
                                                    <Button
                                                        onClick={() => approveRequest(item._id)}
                                                        className={styles.editButton}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => declineRequest(item._id)}
                                                        className={styles.deleteButton}
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                            {item.isApproved == 'Approved' ? (
                                                <div className={styles.cellAction}>
                                                    <Button
                                                        onClick={() => getMultitaskDetail(item._id)}
                                                        className={styles.editButton}
                                                    >
                                                        Xem
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <ReactPaginate
                    previousLabel={'Prev'}
                    nextLabel={'Next'}
                    pageCount={numOfToTalPages}
                    onPageChange={changePage}
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
    );
};

export default Datatable_request;
