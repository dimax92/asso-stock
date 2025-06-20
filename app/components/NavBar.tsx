"use client"
import { UserButton, useUser } from '@clerk/nextjs'
import { HandHeart, LayoutDashboard, ListTree, Menu, PackagePlus, Receipt, ShoppingBasket, Warehouse, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { checkAndAddAssociation } from '../actions'
import Stock from './Stock'

const NavBar = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress
    const [menuOpen, setMenuOpen] = useState<boolean>(false)
    const pathname = usePathname()
    const navLinks = [
        {
            href: "/category",
            label: "Catégories",
            icon: ListTree
        },
        {
            href: "/new-product",
            label: "Nouveau produit",
            icon: PackagePlus
        },
        {
            href: "/products",
            label: "Produits",
            icon: ShoppingBasket
        },
        {
            href: "/give",
            label: "Donner",
            icon: HandHeart
        },
        {
            href: "/transactions",
            label: "Transactions",
            icon: Receipt
        },
        {
            href: "/",
            label: "Tableau de Bord",
            icon: LayoutDashboard
        }
    ]

    const renderLinks = (baseClass: string) => (
        <>
            {
                navLinks.map(({ href, label, icon: Icon }, index) => {
                    const isActive = pathname === href
                    const activeClass = isActive ? 'btn-primary' : 'btn-ghost'
                    return (
                        <Link
                            href={href}
                            key={index}
                            className={`${baseClass} ${activeClass} btn btn-sm gap-2 flex items-center`}
                        >
                            <Icon className='h-4 w-4' />
                            {label}
                        </Link>
                    )
                })
            }
            <button className="btn btn-sm" onClick={()=>(document.getElementById('my_modal_stock') as HTMLDialogElement).showModal()}>
                <Warehouse className='w-4 h-4'/>
                Alimenter le stock
            </button>
        </>
    )

    useEffect(() => {
        if (email && user.fullName) {
            checkAndAddAssociation(email, user.fullName)
        }
    }, [email, user])
    return (
        <div className='border-b border-base-300 px-5 md:px-[10%] py-4 relative'>
            <div className='flex justify-between items-center'>
                <div className='flex items-center'>
                    <div className='p-2'>
                        <PackagePlus className='w-6 h-6 text-primary' />
                    </div>
                    <span className='font-bold text-xl'>AssoStock</span>
                </div>
                <button
                    className='btn w-fit sm:hidden btn-sm'
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <Menu className='w-4 h-4' />
                </button>
                <div className=' hidden space-x-2 sm:flex items-center'>
                    {renderLinks("btn")}
                    <UserButton />
                </div>
            </div>
            <div className={`absolute top-0 w-full bg-base-100 h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden z-50 ${menuOpen ? "left-0" : "-left-full"}`}>
                <div className='flex justify-between'>
                    <UserButton />
                    <button
                        className='btn w-fit sm:hidden btn-sm'
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <X className='w-4 h-4' />
                    </button>
                </div>
                {renderLinks("btn")}
            </div>
            <Stock />
        </div>
    )
}

export default NavBar