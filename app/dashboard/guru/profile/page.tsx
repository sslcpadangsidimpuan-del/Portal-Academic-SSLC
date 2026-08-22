import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi bersih: Versi terbaru supabase-js sudah otomatis mengenali format sb_secret_...
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

export default async function GuruProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { username: (session.user as any).username },
    include: { guruProfile: true },
  });

  if (!currentUser || !currentUser.guruProfile) {
    return <div className="p-8 text-center text-rose-500">Profil Guru tidak ditemukan.</div>;
  }

  const guruProfileId = currentUser.guruProfile.id;

  // ==========================================
  // SERVER ACTION: PROSES UPLOAD TTD KE SUPABASE STORAGE
  // ==========================================
  async function handleUploadSignature(formData: FormData) {
    "use server";
    
    const file = formData.get("signature") as File;
    if (!file || file.size === 0) return;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split('.').pop() || 'png';
    const filePath = `signatures/ttd-${guruProfileId}-${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: file.type || "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Gagal upload TTD ke Supabase Storage:", uploadError);
      throw new Error(`Gagal mengunggah tanda tangan: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("media")
      .getPublicUrl(uploadData.path);

    await prisma.guruProfile.update({
      where: { id: guruProfileId },
      data: { signatureUrl: publicUrlData.publicUrl }
    });

    revalidatePath("/dashboard/guru/profile");
  }

  // ==========================================
  // UI: HALAMAN PROFIL GURU
  // ==========================================
  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account information and e-Signature.</p>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Account Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-400">Full Name</p>
              <p className="font-bold text-slate-700 text-lg">{currentUser.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Username / ID</p>
              <p className="font-bold text-slate-700 text-lg">{currentUser.username}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">e-Signature</h2>
          
          {currentUser.guruProfile.signatureUrl ? (
            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-2 font-medium">Current Signature:</p>
              <div className="border border-slate-200 p-4 rounded-xl inline-block bg-slate-50">
                <img 
                  src={currentUser.guruProfile.signatureUrl} 
                  alt="TTD Guru" 
                  className="h-24 md:h-32 object-contain mix-blend-multiply"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <p className="text-sm text-amber-700 font-bold">⚠️ You haven't uploaded your signature yet.</p>
              <p className="text-xs text-amber-600 mt-1">This signature is required so that your name on the PDF report card bears an official signature mark.</p>
            </div>
          )}

          <form action={handleUploadSignature} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Update / Upload Signature
            </label>
            <p className="text-xs text-slate-500 mb-4">Please use PNG file with a transparent background.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="file" 
                name="signature" 
                accept="image/png, image/jpeg, image/jpg" 
                required
                className="flex-1 bg-white px-4 py-2 rounded-lg border border-slate-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <button 
                type="submit" 
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
              >
                💾 save
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}