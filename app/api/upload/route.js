import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Robust File Upload API Route
 * Parses multipart/form-data using standard Next.js request.formData()
 * Saves statement or invoice files safely to a secure local uploads directory
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") || formData.get("statement");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file was uploaded. Please attach a file." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Secure upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Clean filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrl,
          filename: file.name,
          storedName: uniqueFilename,
          size: file.size,
          type: file.type
        },
        message: "File uploaded successfully."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process file upload." },
      { status: 500 }
    );
  }
}
