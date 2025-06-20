import { Product } from '@/type'
import { useUser } from '@clerk/nextjs'
import React, { FormEvent, useEffect, useState } from 'react'
import { readProducts, replenishStockWithTransaction } from '../actions'
import ProductComponent from './ProductComponent'
import { toast } from 'react-toastify'

const Stock = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [quantity, setQuantity] = useState<number>(0)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const fetchProducts = async () => {
        try {
            if (email) {
                const productsData = await readProducts(email)
                if (productsData) {
                    setProducts(productsData)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email])

    const handleProductChange = (productId: string) => {
        const product = products.find(p => p.id === productId)
        setSelectedProduct(product || null)
        setSelectedProductId(productId)
    }

    const handleSubmit = async(e: FormEvent) => {
e.preventDefault()
if(!selectedProductId || quantity <= 0){
    toast.error("Veuillez selectionner un produit valide")
    return
}
try {
    if(email){
        await replenishStockWithTransaction(selectedProductId, quantity, email)
    }
    toast.success("Stock réapprovisionner avec succès")
    fetchProducts()
    setSelectedProductId("")
    setQuantity(0)
    setSelectedProduct(null)
    const modal = document.getElementById("my_modal_stock") as HTMLDialogElement
    if(modal){
        modal.close()
    }
} catch (error) {
    console.error(error)
}
    }
    return (
        <dialog id="my_modal_stock" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg">Gestion de stock</h3>
                <p className="py-4">Ajouter des quantités</p>
                <form className='space-y-2' onSubmit={handleSubmit}>
                    <label className='block' htmlFor="">Sélectionner un produit</label>
                    <select
                        value={selectedProductId}
                        className='select select-bordered w-full'
                        required
                        onChange={(e) => handleProductChange(e.target.value)}
                    >
                        <option value="">Sélectionner un produit</option>
                        {
                            products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.name} {product.categoryName}
                                </option>
                            ))
                        }

                    </select>
                    {
                        selectedProduct && (
                            <ProductComponent product={selectedProduct} />
                        )
                    }
                    <label className='block'>
                        Quantité a ajouté
                    </label>
                    <input
                        placeholder='Quantité a ajouté'
                        value={quantity}
                        required
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className='input input-bordered w-full'
                        type="number" />
                    <button type='submit' className='btn btn-primary w-fit'>Ajouter au stock</button>
                </form>
            </div>
        </dialog>
    )
}

export default Stock