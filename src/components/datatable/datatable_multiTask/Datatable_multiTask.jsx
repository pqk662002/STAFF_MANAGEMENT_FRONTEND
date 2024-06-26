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
import styles from './datatable_multiTask.module.css';
import Button from 'react-bootstrap/Button';
import ReactPaginate from 'react-paginate';
import queryString from 'query-string';
import { format } from 'date-fns';
const Datatable_multiTask = () => {
    const [departs, setDeparts] = useState([]);
    const [greeting, setGreeting] = useState([]);
    const location = useLocation();
    const params = queryString.parse(location.search);
    const [username, setUsername] = useState(() => {
        return params.username;
    });
    const [position, setPosition] = useState(() => {
        return params.position;
    });

    const [department, setDepartment] = useState(() => {
        return params.department;
    });
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

    const [email, setEmail] = useState(() => {
        return params.email;
    });
    const [tableDataSVT, setTableDataSVT] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

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
        loadSVT();
    }, []);

    function buildSearchURL() {
        const searchData = {
            usernameSearch: username || '',
            emailSearch: email || '',
            position: position || '',
            department: department || '',
        };
        let url = `http://localhost:5555/v1/multiTask/?`;

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

        //check department
        url = url + `&department=${searchData.department}`;

        return url;
    }

    const mapValueToLabel = (value) => {
        const department = departments.find((dept) => dept.value === value);
        return department ? department.label : '';
    };

    const convertDeparts = (items) => {
        let departments = [];
        for (let index = 0; index < items.length; index++) {
            const department = items[index].department.label;
            departments.push(department);
        }
        return departments.join(', ');
    };

    const loadSVT = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        // const url = buildSearchURL();
        let url = `http://localhost:5555/v1/multiTask/?`;
        //check department
        const decodedToken = jwtDecode(accessToken);

        url = url + `department=${decodedToken.department}`;
        setGreeting(mapValueToLabel(decodedToken.department));
        axios
            .get(url, { headers: { Authorization: `Bearer ${accessToken}` } })
            .then((response) => {
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

    function viewDetail(id) {
        navigate(`/multiTask/${id}`);
    }

    useEffect(() => {
        async function checkAuth() {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                const decodedToken = jwtDecode(accessToken);
                setIsAdmin(decodedToken.isAdmin);
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

    const deleteUser = async (id) => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log(id);
        axios
            .delete(`http://localhost:5555/v1/user/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } })
            .then((response) => {
                console.log(response);
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
                    <b>Danh Sách Yêu Cầu Liên Đơn Vị</b>
                </div>
                <b>Nơi xử lý yêu cầu đơn vị của chức vụ Trưởng Phòng</b>
                <TableContainer component={Paper} className={styles.table}>
                    <Table sx={{ minWidth: 1200 }} aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell className={styles.tableCell + ' text-center'}>STT</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Tiêu đề</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Ngày Tạo</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Các Phòng Ban</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Trạng Thái</TableCell>
                                <TableCell className={styles.tableCell + ' text-center'}>Lựa Chọn</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleSVT?.length > 0 &&
                                departs &&
                                visibleSVT?.map((item, index) => (
                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell className={styles.tableCell + ' text-center'}>{index + 1}</TableCell>

                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            {item.requestid?.title}
                                        </TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            {format(item.createdAt, 'MM/dd/yyyy kk:mm:ss')}
                                        </TableCell>
                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            {convertDeparts(item.tasks)}
                                        </TableCell>
                                        {item.status == 'Đã Hoàn Thành' ? (
                                            <TableCell
                                                className={styles.tableCell + ' text-center'}
                                                style={{ background: 'green' }}
                                            >
                                                {item.status}
                                            </TableCell>
                                        ) : (
                                            <TableCell className={styles.tableCell + ' text-center'}>
                                                {item.status}
                                            </TableCell>
                                        )}

                                        <TableCell className={styles.tableCell + ' text-center'}>
                                            <div className={styles.cellAction}>
                                                <Button
                                                    onClick={() => viewDetail(item._id)}
                                                    className={styles.editButton}
                                                >
                                                    Xem chi tiết
                                                </Button>
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

export default Datatable_multiTask;
