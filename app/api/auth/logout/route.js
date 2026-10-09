import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear crown_session cookie across all options
    cookieStore.delete("crown_session");
    cookieStore.set({
      name: "crown_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
      expires: new Date(0)
    });

    return NextResponse.json({ 
      success: true, 
      message: "Session ended successfully." 
    }, { status: 200 });
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

export async function GET() {
  return POST();
}
