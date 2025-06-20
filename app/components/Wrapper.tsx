"use client"
import React, { FC, ReactNode } from 'react'
import NavBar from './NavBar'
import { ToastContainer } from 'react-toastify'

type Props = {
    children: ReactNode
}

const Wrapper: FC<Props> = ({ children }) => {
    return (
        <div>
            <NavBar />
            <ToastContainer
                position='top-right'
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
                draggable
            />
            <div className='px-5 md:px-[10%] mt-8 mb-10'>
                {children}
            </div>
        </div>
    )
}

export default Wrapper