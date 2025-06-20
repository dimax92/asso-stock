"use client"
import { Transaction } from '@/type'
import React, { useEffect, useState } from 'react'
import { getTransactions } from '../actions'
import EmptyState from './EmptyState'
import TransactionComponent from './TransactionComponent'

const ResendTransactions = ({ email }: { email: string }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {
            const fetchData = async () => {
        try {
            if (email) {
                const txs = await getTransactions(email, 10)
                if (txs) {
                    setTransactions(txs)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }
        fetchData()
    }, [email])

    return (
        <div className='w-full border-2 border-base-200 mt-4 p-4 rounded-3xl'>
            {
                transactions.length === 0 ? (
                    <EmptyState message='Aucune transaction' IconComponent='CaptionsOff' />
                ) : (
                    <div className=''>
                        <h2 className='text-xl font-bold mb-4'>10 Dernières transactions</h2>
                        <div className='space-y-4'>
                            {
                            transactions.map(tx => (
                                <TransactionComponent key={tx.id} tx={tx} />
                            ))
                        }
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default ResendTransactions