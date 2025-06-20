"use client"
import React, { ChangeEvent, useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Category } from '@prisma/client'
import { FormDataType } from '@/type'
import { createProduct, readCategories } from '../actions'
import EmptyState from '../components/EmptyState'
import ProductImage from '../components/ProductImage'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const Page = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [formData, setFormData] = useState<FormDataType>({
        id: "",
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        unit: ""
    })

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const loadCategories = async () => {
        try {
            if (email) {
                const data = await readCategories(email)
                if (data) {
                    setCategories(data)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile))
        }
    }

    const handleSubmit = async () => {
        if (!email) return
        if (!file) {
            toast.error("Il n'y a pas de fichier")
            return
        }
        try {
            const imageData = new FormData()
            imageData.append("file", file)
            const res = await fetch("/api/upload", {
                method: "POST",
                body: imageData
            })

            const data = await res.json()

            if (!data.success) {
                throw new Error("erreur upload image")
            } else {
                formData.imageUrl = data.path
                await createProduct(formData, email)
                toast.success("Produit crée avec succès")
                router.push("/products")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur")
        }
    }
    return (
        <Wrapper>
            <div className='flex justify-center items-center'>
                <div>
                    <h1 className='text-2xl font-bold mb-4'>Créer  un produit</h1>
                    <section className='flex md:flex-row flex-col'>
                        <div className='space-y-4 md:w-[450px]'>
                            <input
                                type="text"
                                name='name'
                                placeholder='Nom'
                                className='input input-bordered w-full'
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <textarea
                                name="description"
                                placeholder='Description'
                                className='textarea textarea-bordered w-full'
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                            <input
                                type="number"
                                name='price'
                                placeholder='Prix'
                                className='input input-bordered w-full'
                                value={formData.price}
                                onChange={handleChange}
                            />
                            <select
                                name="categoryId"
                                className='select select-bordered w-full'
                                value={formData.categoryId}
                                onChange={handleChange}
                            >
                                <option value="">Sélectionne une catégorie</option>
                                {
                                    categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))
                                }
                            </select>
                            <select
                                name="unit"
                                className='select select-bordered w-full'
                                value={formData.unit}
                                onChange={handleChange}
                            >
                                <option value="">Sélectionne unité</option>
                                <option value="g">Gramm</option>
                                <option value="kg">Kilo</option>
                                <option value="l">Litre</option>
                                <option value="m">Mètre</option>
                                <option value="cm">Centimètre</option>
                                <option value="h">Heure</option>
                                <option value="pcs">Pièces</option>
                            </select>

                            <input
                                type="file"
                                name=""
                                accept='image/*'
                                className='file-input file-input-bordered w-full'
                                onChange={handleFileChange}
                            />
                            <button onClick={handleSubmit} className='btn btn-primary'>Créer le produit</button>
                        </div>
                        <div className='md:ml-4 md:w-[300px] mt-4 md:mt-0 border-2 border-primary md:h-[300px] p-5 flex justify-center items-center rounded-3xl'>
                            {
                                previewUrl && previewUrl !== "" ? (
                                    <div>
                                        <ProductImage
                                            src={previewUrl}
                                            alt={"preview"}
                                            heightClass='h-40'
                                            widthClass='w-40'
                                        />
                                    </div>
                                ) : (
                                    <EmptyState IconComponent='FileImage' message='Pas image' />
                                )
                            }
                        </div>
                    </section>
                </div>
            </div>
        </Wrapper>
    )
}

export default Page