import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/upload";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadImage(buffer, file.name, file.type);
    
    return NextResponse.json({ url: imageUrl }, { status: 201 });
  } catch (error) {
    console.error("Image upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
