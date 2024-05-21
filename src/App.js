import React, { useEffect, useState } from 'react';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Single from './pages/single/Single';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './style/dark.scss';
import { useContext } from 'react';
import { DarkModeContext } from './context/darkModeContext';
import List_user from './pages/list/list_users/List_user';
import List_order from './pages/order/List_order';
import Announcement from './pages/announcement/Announcement';
import Document from './pages/document/Document';
import MakeCalendar from './pages/calendars/makeCalendar';
import Add from './pages/users/Add/Add';
import AddTask from './pages/multitask/Add/Add';
import AddRequest from './pages/request/Add/Add';
import Password from './pages/users/Password/Password';
import List_request from './pages/list/list_request/List_request';
import List_multiTask from './pages/list/list_multiTask/List_multiTask';
import SingleMultiTask from './pages/multitask/View/Single';
<<<<<<< Updated upstream
import Profile from './pages/Profile/Profile';
=======
import Notice from './pages/notice/Notice';

>>>>>>> Stashed changes
function App() {
    const { darkMode } = useContext(DarkModeContext);
    return (
        <div className={darkMode ? 'app dark' : 'app'}>
            <BrowserRouter>
                <Routes>
                    <Route path="/">
                        <Route index element={<Home />} />

                        <Route path="notice">
                            <Route index element={<Notice />} />
                        </Route>

                        <Route path="announcement">
                            <Route index element={<Announcement />} />
                        </Route>
                        <Route path="document">
                            <Route index element={<Document />} />
                        </Route>

                        <Route path="users">
                            <Route index element={<List_user />} />
                            <Route path=":userId" element={<Single />} />
                            <Route path="add" element={<Add />} />
                            <Route path="profile/:userId" element={<Profile />} />
                            <Route path="changePassword/:userId" element={<Password />} />
                        </Route>
                        <Route path="requests">
                            <Route index element={<List_request />} />
                            <Route path="add" element={<AddRequest />} />
                        </Route>
                        <Route path="multiTask">
                            <Route index element={<List_multiTask />} />
                            <Route path="add/:requestId" element={<AddTask />} />
                            <Route path=":multiTaskId" element={<SingleMultiTask />} />
                        </Route>
                        <Route path="calendar">
                            <Route index element={<MakeCalendar />} />
                        </Route>

                        <Route path="login">
                            <Route index element={<Login />} />
                        </Route>

                        {/* <Route path="changePassword">
              <Route index element={<Password />} />

            </Route> */}
                        <Route path="orders">
                            <Route index element={<List_order />} />
                            {/* <Route path=":userId" element={<Single />} /> */}
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
