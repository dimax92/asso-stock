"use server"

import prisma from "@/lib/prisma"
import { FormDataType, OrderItem, Product, ProductOverviewStats, StockSummary, Transaction } from "@/type"
import { Category } from "@prisma/client"

export async function checkAndAddAssociation(email: string, name: string) {
    if (!email) return
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email
            }
        })

        if (!existingAssociation && name) {
            await prisma.association.create({
                data: {
                    email,
                    name
                }
            })
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getAssociation(email: string) {
    if (!email) return
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email
            }
        })

        return existingAssociation
    } catch (error) {
        console.error(error)
    }
}

export async function createCategory(
    name: string,
    email: string,
    description?: string
) {
    if (!name) return
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }
        await prisma.category.create({
            data: {
                name,
                description: description || "",
                associationId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function updateCategory(
    id: string,
    email: string,
    name: string,
    description?: string
) {
    if (!name || !email || !id) {
        throw new Error("name, id, email requis")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }
        await prisma.category.update({
            where: {
                id,
                associationId: association.id
            },
            data: {
                name,
                description: description || ""
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function deleteCategory(id: string, email: string) {
    if (!email || !id) {
        throw new Error("id, email requis")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }
        await prisma.category.delete({
            where: {
                id,
                associationId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function readCategories(email: string): Promise<Category[] | undefined> {
    if (!email) {
        throw new Error("email requis")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }
        const categories = await prisma.category.findMany({
            where: {
                associationId: association.id
            }
        })

        return categories
    } catch (error) {
        console.error(error)
    }
}

export async function createProduct(formData: FormDataType, email: string) {
    try {
        const { name, description, price, imageUrl, categoryId, unit } = formData
        if (!email || !price || !categoryId) {
            throw new Error("email requis")
        }
        const safeImageUrl = imageUrl || ""
        const safeUnit = unit || ""
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }
        await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                imageUrl: safeImageUrl,
                categoryId,
                unit: safeUnit,
                associationId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function updateProduct(formData: FormDataType, email: string) {
    try {
        const { id, name, description, price, imageUrl } = formData
        if (!email || !price || !id) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }

        await prisma.product.update({
            where: {
                id,
                associationId: association.id
            },
            data: {
                name,
                description,
                price: Number(price),
                imageUrl: imageUrl
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function deleteProduct(id: string, email: string) {
    try {
        if (!email || !id) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }
        await prisma.product.delete({
            where: {
                id,
                associationId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function readProducts(email: string): Promise<Product[] | undefined> {
    try {
        if (!email) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }

        const products = await prisma.product.findMany({
            where: {
                associationId: association.id
            },
            include: {
                category: true
            }
        })

        return products.map(product => ({
            ...product,
            categoryName: product.category.name
        }))
    } catch (error) {
        console.error(error)
    }
}

export async function readProductById(productId: string, email: string): Promise<Product | undefined> {
    try {
        if (!email) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }

        const product = await prisma.product.findUnique({
            where: {
                associationId: association.id,
                id: productId
            },
            include: {
                category: true
            }
        })

        if (!product) return undefined

        return {
            ...product,
            categoryName: product.category.name
        }
    } catch (error) {
        console.error(error)
    }
}

export async function replenishStockWithTransaction(productId: string, quantity: number, email: string) {
    try {
        if (quantity <= 0) {
            throw new Error("Quantité pas bonne")
        }
        if (!email) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }

        await prisma.product.update({
            where: {
                id: productId,
                associationId: association.id
            },
            data: {
                quantity: {
                    increment: quantity
                }
            }
        })

        await prisma.transaction.create({
            data: {
                type: "IN",
                quantity,
                productId,
                associationId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function deductStockWithTransaction(orderItems: OrderItem[], email: string) {
    try {
        if (!email) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }

        for (const item of orderItems) {
            const product = await prisma.product.findUnique({
                where: {
                    id: item.productId
                }
            })
            if (!product) {
                throw new Error("Pas de produit")
            }
            if (item.quantity <= 0) {
                throw new Error("Quantité pas suffisante")
            }
            if (product.quantity < item.quantity) {
                throw new Error("Item a plus de stock que le produit")
            }
        }

        await prisma.$transaction(async (tx) => {
            for (const item of orderItems) {
                await tx.product.update({
                    where: {
                        id: item.productId,
                        associationId: association.id
                    },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                })

                await tx.transaction.create({
                    data: {
                        type: "OUT",
                        quantity: item.quantity,
                        productId: item.productId,
                        associationId: association.id
                    }
                })
            }
        })

        return {
            success: true
        }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: error
        }
    }
}

export async function getTransactions(email: string, limit?: number): Promise<Transaction[] | undefined>{
    try {
          if (!email) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }
        const transactions = await prisma.transaction.findMany({
            where: {
                associationId: association.id
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit,
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        })

        return transactions.map(tx => ({
            ...tx,
            categoryName: tx.product.category.name,
            productName: tx.product.name,
            imageUrl: tx.product.imageUrl,
            price: tx.product.price,
            unit: tx.product.unit
        }))
    } catch (error) {
        console.error(error)
    }
}

export async function getProductOverviewStats(email: string): Promise<ProductOverviewStats | undefined>{
    try {
                  if (!email) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }

        const products = await prisma.product.findMany({
            where: {
                associationId: association.id
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                category: true
            }
        })

        const transactions = await prisma.transaction.findMany({
            where: {
                associationId: association.id
            },
        })

        const categoriesSet = new Set(products.map(product => product.category.name))

        const totalProducts = products.length
        const totalCategories = categoriesSet.size
        const totalTransactions = transactions.length
        const stockValue = products.reduce((acc, product) => acc+product.price * product.quantity, 0)

        return {
           totalProducts,
            totalCategories,
            totalTransactions,
            stockValue
        }
    } catch (error) {
        console.error(error)
        return {
           totalProducts: 0,
            totalCategories: 0,
            totalTransactions: 0,
            stockValue: 0
        }
    }
}

export async function getProductCategoryDistribution(email: string){
    try {
          if (!email) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        }

        const R = 5

        const categoriesWithProductCount = await prisma.category.findMany({
            where: {
                associationId: association.id
            },
            include: {
                products: {
                    select: {
                        id: true
                    }
                }
            }
        })

        const data = categoriesWithProductCount.map(category => ({
            name: category.name,
            value: category.products.length,

        })).sort((a,b)=> b.value - a.value).slice(0, R)

        return data
    } catch (error) {
       console.error(error) 
    }
}

export async function getStockSummary (email:string): Promise<StockSummary>{
    try {
        if (!email) {
            throw new Error("email requis")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune asso trouvé avec email")
        } 

        const allProducts = await prisma.product.findMany({
            where: {
                associationId: association.id
            },
            include: {
                category: true
            }
        })

        const inStock = allProducts.filter(p => p.quantity > 5)
        const lowStock = allProducts.filter(p => p.quantity > 0 && p.quantity <= 2)
        const outOfStock = allProducts.filter(p => p.quantity === 0)
        const criticalProducts = [...lowStock, ...outOfStock]
        return {
            inStockCount: inStock.length,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            criticalProducts: criticalProducts.map(p => ({
                ...p,
                categoryName: p.category.name
            }))
        }
    } catch (error) {
        console.error(error) 
        return {
            inStockCount: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            criticalProducts: []
        }
    }
}