import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * CA-Staff Bank Statement Upload Route
 * STRICT COMPLIANCE:
 * - Uses Next.js native: const data = await request.formData(); const file = data.get('file');
 * - No legacy body parsers (no formidable, busboy, or multer).
 * - Client fetch MUST omit 'Content-Type' header so browser generates multipart boundary automatically.
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
      return NextResponse.json({ success: false, error: "Invalid session token." }, { status: 401 });
    }

    // Native Next.js FormData extraction
    const data = await request.formData();
    const file = data.get("file") || data.get("statement");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No bank statement file uploaded. Please select a valid file." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save safely to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const sanitizedFilename = (file.name || "statement.pdf").replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `bank_reco_${timestamp}_${sanitizedFilename}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrl,
          fileUrl: publicUrl,
          filename: file.name,
          storedName: uniqueFilename,
          size: file.size,
          type: file.type
        },
        message: "Bank statement uploaded and stored successfully."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bank Statement Upload Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process bank statement upload." },
      { status: 500 }
    );
  }
}
