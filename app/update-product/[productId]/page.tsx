"use client"
import { readProductById, updateProduct } from '@/app/actions'
import EmptyState from '@/app/components/EmptyState'
import ProductImage from '@/app/components/ProductImage'
import Wrapper from '@/app/components/Wrapper'
import { FormDataType, Product } from '@/type'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const Page = ({ params }: { params: Promise<{ productId: string }> }) => {
    const router = useRouter()
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress
    const [product, setProduct] = useState<Product | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [formData, setFormData] = useState<FormDataType>({
        id: "",
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        categoryName: ""
    })

    const fetchProduct = async () => {
        try {
            const { productId } = await params
            if (email) {
                const fetchedProduct = await readProductById(productId, email)
                if (fetchedProduct) {
                    setProduct(fetchedProduct)
                    setFormData({
                        id: fetchedProduct.id,
                        name: fetchedProduct.name,
                        description: fetchedProduct.description,
                        price: fetchedProduct.price,
                        imageUrl: fetchedProduct.imageUrl,
                        categoryName: fetchedProduct.categoryName
                    })
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile))
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        let imageUrl = formData.imageUrl
        e.preventDefault()
        try {
            if (file) {
                const resDelete = await fetch("/api/upload", {
                    method: "DELETE",
                    body: JSON.stringify({ path: formData.imageUrl }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                const dataDelete = await resDelete.json()

                if (!dataDelete.success) {
                    throw new Error("Erreur suppression image")
                }
                const imageData = new FormData()
                imageData.append("file", file)
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: imageData
                })

                const data = await res.json()

                if (!data.success) {
                    throw new Error("erreur upload image")
                }

                imageUrl = data.path

                formData.imageUrl = imageUrl

                if (!email) return

                await updateProduct(formData, email)
                toast.success("Produit modifié!")
                router.push("/products")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur handleSubmit")
        }
    }
    return (
        <Wrapper>
            <div>
                {
                    product ? (
                        <div>
                            <h1 className='text-2xl font-bold mb-4'>Mise a jour produit</h1>
                            <div className='flex md:flex-row flex-col md:items-center'>
                                <form className='space-y-2' onSubmit={handleSubmit}>
                                    <div className='text-sm font-semibold mb-2'>Nom</div>
                                    <input
                                        type="text"
                                        name='name'
                                        placeholder='Nom'
                                        className='input input-bordered w-full'
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                    <div className='text-sm font-semibold mb-2'>Description</div>
                                    <textarea
                                        name="description"
                                        placeholder='Description'
                                        className='textarea textarea-bordered w-full'
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>

                                    <div className='text-sm font-semibold mb-2'>Catégorie</div>
                                    <input
                                        type="text"
                                        name='categoryName'
                                        placeholder={`${formData.categoryName}`}
                                        className='input input-bordered w-full'
                                        value={formData.categoryName}
                                        disabled
                                    />
                                    <div className='text-sm font-semibold mb-2'>Image / Prix unitaire</div>
                                    <div className='flex'>
                                        <input
                                            type="file"
                                            name=""
                                            accept='image/*'
                                            className='file-input file-input-bordered w-full'
                                            onChange={handleFileChange}
                                        />
                                        <input
                                            type="number"
                                            name='price'
                                            placeholder='Prix'
                                            className='input input-bordered w-full ml-4'
                                            value={formData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <button type='submit' className='btn btn-primary mt-3'>Mettre a jour</button>
                                </form>
                                <div className='flex md:flex-col md:ml-4 mt-4 md:mt-0'>
                                    <div className='md:ml-4 md:w-[200px] mt-4 md:mt-0 border-2 border-primary md:h-[200px] p-5 md:flex justify-center items-center rounded-3xl hidden'>
                                        {
                                            formData.imageUrl && formData.imageUrl !== "" ? (
                                                <div>
                                                    <ProductImage
                                                        src={formData.imageUrl}
                                                        alt={product.name}
                                                        heightClass='h-40'
                                                        widthClass='w-40'
                                                    />
                                                </div>
                                            ) : (
                                                <EmptyState IconComponent='FileImage' message='Pas image' />
                                            )
                                        }
                                    </div>
                                    <div className='w-full md:ml-4 md:w-[200px] mt-4 border-2 border-primary md:h-[200px] p-5 flex justify-center items-center rounded-3xl md:mt-4'>
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
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex justify-center items-center w-full'>
                            <span className="loading loading-spinner loading-xl"></span>
                        </div>
                    )
                }
            </div>
        </Wrapper>
    )
}

export default Page