"use client"
import { ChartData } from '@/type'
import React, { useEffect, useState } from 'react'
import { getProductCategoryDistribution } from '../actions'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from 'recharts';
import EmptyState from './EmptyState';

const CategoryChart = ({ email }: { email: string }) => {
    const [data, setData] = useState<ChartData[]>([])
    const COLORS = {
        default: "#F1D2BF"
    }
    useEffect(() => {
            const fetchStats = async () => {
        try {
            if (email) {
                const result = await getProductCategoryDistribution(email)
                if (result) {
                    setData(result)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }
        fetchStats()
    }, [email])

    const renderCharts = (widthOverride?: string) => (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={data}
                margin={{
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                }}
                barCategoryGap={widthOverride ? 0 : "10"}
            >
                <XAxis
                    axisLine={false}
                    tickLine={false}
                    tick={
                        { fontSize: 15, fill: "#793205", fontWeight: "bold" }
                    }
                    dataKey="name" />
                <YAxis
                    hide
                />
                <Bar
                    radius={[8, 8, 0, 0]}
                    dataKey="value"
                    
                    barSize={200}
                >
                    <LabelList 
                    fill="#793205"
                    dataKey={"value"}
                    position={"insideRight"}
                    style={{fontSize: "20px", fontWeight: "bold"}}
                    />
                    {
                        data.map((entry, index) => (
                            <Cell 
                            key={`cell-${index}`}
                            cursor={"default"}
                            fill={COLORS.default}
                            />
                        ))
                    }
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )

    if (data.length === 0) {
        return (
            <div className='w-full border-2 border-base-200 mt-4 p-4 rounded-3xl'>
                <h2 className='text-xl font-bold mb-4'>5 catégories avec le plus de produits</h2>
                <EmptyState message='Aucun catégorie disponible' IconComponent='Group' />
            </div>
        )
    }
    return (
        <div className='w-full border-2 border-base-200 mt-4 p-4 rounded-3xl'>
            <h2 className='text-xl font-bold mb-4'>5 catégories avec le plus de produits</h2>
            {
                renderCharts()
            }
        </div>
    )
}

export default CategoryChart