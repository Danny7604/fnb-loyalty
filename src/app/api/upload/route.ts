import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    // Check size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File ảnh không được vượt quá 10MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ["png", "jpg", "jpeg", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
    const filename = `dish-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xiqlvsstqxsghktpxzfe.supabase.co";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpcWx2c3N0cXhzZ2hrdHB4emZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzgwODI3NywiZXhwIjoyMTA5Mzg0Mjc3fQ.VpwEdEG_pOEO-WxztHIdpdnXLLHxTZFdLAXy2NRrF88";

    try {
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/menu-images/${filename}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": file.type || "image/jpeg",
          "x-upsert": "true",
        },
        body: buffer,
      });

      if (uploadRes.ok) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/menu-images/${filename}`;
        return NextResponse.json({ success: true, url: publicUrl });
      }
      
      const errText = await uploadRes.text();
      console.warn("Supabase upload returned non-200:", errText);
    } catch (storageErr) {
      console.warn("Storage upload fetch error:", storageErr);
    }

    // Fallback: If storage upload fails, return base64 Data URL so the app continues seamlessly
    const base64 = buffer.toString("base64");
    const mime = file.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;
    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Lỗi tải ảnh lên" }, { status: 500 });
  }
}
