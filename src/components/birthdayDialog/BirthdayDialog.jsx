import React from 'react'
import {Dialog, DialogContent} from "@mui/material";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";
import {LocalstorageKey} from "../../constants/localstorage";

const BirthdayDialog =
    React.forwardRef(({...props}, ref) => {
        // state
        const [open, setOpen] = React.useState(false)
        const [user, setUser] = React.useState(null)

        // local storage
        window.addEventListener('storage', async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                const decodedToken = jwtDecode(accessToken);
                setUser(decodedToken)
            } catch (e) {
                setUser(null)
            }
        })

        /**
         * detect user to open dialog
         */
        React.useEffect(() => {
            if (user?.birth && !isNaN(new Date(user.birth))) {
                const isBirthday = new Date(user.birth).toISOString().slice(5, 10)
                    === new Date().toISOString().slice(5, 10)
                let hasShown = false
                try {
                    hasShown = JSON.parse(localStorage.getItem(LocalstorageKey.birthdayNotify))[user.iat]
                } catch {
                }
                if (isBirthday && !hasShown) {
                    setOpen(true)
                    localStorage.setItem(LocalstorageKey.birthdayNotify, JSON.stringify({
                        [user.iat]: true
                    }))
                }
            }
        }, [user])

        /**
         * react use effect
         *
         */
        React.useEffect(() => {
            AsyncStorage.getItem('accessToken').then((accessToken) => {
                const decodedToken = jwtDecode(accessToken);
                setUser(decodedToken)
            });

            return () => {
                window.removeEventListener('storage', () => {
                })
            }
        }, [])

        /**
         * handler ref
         */
        React.useImperativeHandle(ref, () => ({
            open: (user) => {
                if (user) {
                    setUser(user)
                    setOpen(true)
                    localStorage.setItem(LocalstorageKey.birthdayNotify, JSON.stringify({
                        [user.id]: true
                    }))
                }
            }
        }))

        return <>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogContent>
                    <div className='border-5' style={{borderStyle: 'double'}}>
                        <div className='fs-1 text-center my-3'>Chúc mừng sinh nhật</div>
                        <div className="text-primary fs-3 text-uppercase text-center my-3">{user?.fullname}</div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    })

export default BirthdayDialog