import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import Invoices from '@/app/schema/invoices'
import { connectDB } from "../loginuser/route"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("image");
        console.log("File received:", file?.name);

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");

        const prompt = `
        Analyze this invoice image and extract the merchant information.
        Return ONLY a raw, valid JSON object with the following keys:
        - "merchant_name"
        - "merchant_phone"
        - "merchant_address"
        - "Bill_No"
        - "GST_NO"
        - "Bill_Date"
        - "Total"
        - "CGST"
        - "SGST"
        - "IGST"

        If you cannot find a specific piece of information, set its value to null.
        Do not include markdown formatting like \`\`\`json.
        `;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: file.type,
            },
        };

        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                attempts++;
                const result = await model.generateContent([prompt, imagePart]);
                const responseText = await result.response.text();

                let cleanJson = responseText.trim();
                if (cleanJson.startsWith("```json")) {
                    cleanJson = cleanJson.replace(/```json/g, "").replace(/```/g, "").trim();
                }
                if (!cleanJson) {
                    return NextResponse.json({ success: false, error: "Empty AI response" }, { status: 400 });
                }

                const merchantData = JSON.parse(cleanJson);

                await connectDB()
                const newdata = await Invoices.create(merchantData)
                if (!newdata) {
                    return NextResponse({ success: false, msg: "The user data is not stored" }, { status: 400 })
                }
                console.log('The data send is ', newdata)
                return NextResponse.json({ success: true, data: newdata });

            } catch (apiError) {
                console.error(`Attempt ${attempts} failed:`, apiError.message);

                if (attempts < maxRetries && (apiError.message.includes("503") || apiError.message.toLowerCase().includes("overloaded"))) {
                    console.log("Model overloaded. Waiting 3 seconds before retrying...");
                    await delay(3000);
                    continue;
                }

                throw apiError;
            }
        }

    } catch (error) {
        console.error("Final Error in Route:", error);

        return NextResponse.json({
            success: false,
            error: "The AI scanner is currently busy or overloaded. Please try again.",
            details: error.message
        }, { status: 503 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const invoices = await Invoices.find({}).sort({ createdAt: -1 });
        console.log('invoices are',invoices)
        if (!invoices) {
            return NextResponse.json({ success: false, msg: "The invoices data failed to fetch " }, { status: 400 })
        }
        return NextResponse.json({ success: true, data: invoices });
    } catch (error) {
        console.log("Failed to fetch invoices:", error);
        return NextResponse.json(
            { success: false, error: "Failed to load invoices" },
            { status: 500 }
        );
    }
}