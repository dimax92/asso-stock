"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import CategoryModal from '../components/CategoryModal'
import { useUser } from '@clerk/nextjs'
import { createCategory, deleteCategory, readCategories, updateCategory } from '../actions'
import { toast } from 'react-toastify'
import { Category } from '@prisma/client'
import EmptyState from '../components/EmptyState'
import { Pencil, Trash } from 'lucide-react'

const Page = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])

    const loadCategories = async () => {
        if (email) {
            const data = await readCategories(email)
            if (data) {
                setCategories(data)
            }
        }
    }

    useEffect(() => {
        loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email])

    const openCreateModal = () => {
        setName("")
        setDescription("")
        setEditMode(false);
        (document.getElementById("category_modal") as HTMLDialogElement)?.showModal()
    }

    const closeModal = () => {
        setName("")
        setDescription("")
        setEditMode(false);
        (document.getElementById("category_modal") as HTMLDialogElement)?.close()
    }

    const handleCreateCategory = async () => {
        setLoading(true)
        if (email) {
            await createCategory(name, email, description)
        }
        await loadCategories()
        closeModal()
        setLoading(false)
        toast.success("Catégorie créé avec succès")
    }

    const handleUpdateCategory = async () => {
        if (!editingCategoryId) return
        setLoading(true)
        if (email) {
            await updateCategory(editingCategoryId, email, name, description)
        }
        await loadCategories()
        closeModal()
        setLoading(false)
        toast.success("Catégorie mise a jour avec succès")
    }

    const openEditModal = (category: Category) => {
        setName(category.name)
        setDescription(category.description || "")
        setEditMode(true)
        setEditingCategoryId(category.id);
        (document.getElementById("category_modal") as HTMLDialogElement)?.showModal()
    }

    const handleDeleteCategory = async (categoryId: string) => {
        const confirmDelete = confirm("Voulez vous vraiment supprimer cette catégorie")
        if(!confirmDelete) return
        if(email){
            await deleteCategory(categoryId, email)
        }
        await loadCategories()
        toast.success("Catégorie mise a jour avec succès")
    }
    return (
        <Wrapper>
            <div>
                <div className='mb-4 '>
                    <button
                        onClick={openCreateModal}
                        className='btn btn-primary'
                    >Ajouter une catégorie</button>
                </div>
                {
                    categories.length > 0 ? (
                        <div>
                            {
                                categories.map((category) => (
                                    <div key={category.id} className='mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center'>
                                        <div>
                                            <strong className='text-lg'>
                                                {category.name}
                                            </strong>
                                            <div className='text-sm'>
                                                {category.description}
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <button className='btn btn-sm' onClick={() => openEditModal(category)}>
                                                <Pencil className='w-4 h-4' />
                                            </button>
                                            <button className='btn btn-sm btn-error' onClick={() => handleDeleteCategory(category.id)}>
                                                <Trash className='w-4 h-4' />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <EmptyState IconComponent='Group' message='Aucune catégorie disponible' />
                    )
                }
            </div>
            <CategoryModal
                name={name}
                description={description}
                loading={loading}
                onChangeName={setName}
                onChangeDescription={setDescription}
                onclose={closeModal}
                onsubmit={editMode ? handleUpdateCategory : handleCreateCategory}
                editMode={editMode}
            />
        </Wrapper>
    )
}

export default Page