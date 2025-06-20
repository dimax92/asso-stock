"use server"

import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get("file") as File

        if (!file) {
            return NextResponse.json({ success: false })
        }

        const bytes = await file.arrayBuffer()

        const buffer = Buffer.from(bytes)

        const uploadDir = join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const ext = file.name.split(".").pop()
        const uniqueName = crypto.randomUUID() + '.' + ext
        const filePath = join(uploadDir, uniqueName)
        await writeFile(filePath, buffer)
        const publicPath = `/uploads/${uniqueName}`

        return NextResponse.json({ success: true, path: publicPath })
    } catch (error) {
        console.error(error)
    }
}

export async function DELETE(request: NextRequest) {
try {
    const {path} = await request.json()
    if(!path){
         return NextResponse.json({ success: false, message: "Chemin invalide" }, {status: 400})
    }

    const filepath = join(process.cwd(),"public",path)

    if(!existsSync(filepath)){
    return NextResponse.json({ success: false, message: "Fichier non trouvé" }, {status: 404})
    }

    await unlink(filepath)

        return NextResponse.json({ success: true, message: "Fichier supprimé" }, {status: 201})
} catch (error) {
    console.error(error)
}
}