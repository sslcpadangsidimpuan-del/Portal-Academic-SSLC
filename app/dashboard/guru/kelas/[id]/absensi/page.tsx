import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AbsensiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Rentang waktu hari ini (00:00:00 sampai 23:59:59)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Mengambil data kelas, siswa, sekaligus data absensi mereka KHUSUS HARI INI
  const level = await prisma.level.findUnique({
    where: { id: id },
    include: {
      siswas: {
        include: { 
          user: true,
          absensi: {
            where: {
              date: {
                gte: startOfDay,
                lte: endOfDay,
              }
            },
            take: 1
          }
        },
      },
    },
  });

  if (!level) return <div className="p-8 text-center text-slate-500">Kelas tidak ditemukan.</div>;

  // === SERVER ACTION: Menyimpan / Perbarui Absensi ===
  async function simpanAbsensi(formData: FormData) {
    "use server"; 

    if (!level) throw new Error("Kelas tidak ditemukan");

    try {
      for (const siswa of level.siswas) {
        const status = formData.get(`status_${siswa.id}`) as string;
        if (!status) continue;

        const existingAbsensi = await prisma.absensi.findFirst({
          where: {
            siswaId: siswa.id,
            date: {
              gte: startOfDay,
              lte: endOfDay,
            }
          }
        });

        if (existingAbsensi) {
          await prisma.absensi.update({
            where: { id: existingAbsensi.id },
            data: { status, levelId: level.id }
          });
        } else {
          await prisma.absensi.create({
            data: {
              siswaId: siswa.id,
              status,
              date: new Date(),
              levelId: level.id,
            }
          });
        }
      }
    } catch (error) {
      console.error("Gagal menyimpan absensi:", error);
    }

    revalidatePath(`/dashboard/guru/kelas/${id}/absensi`);
    redirect(`/dashboard/guru/kelas/${id}`);
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 box-border w-full">
      
      {/* Header Responsive */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href={`/dashboard/guru/kelas/${id}`} className="text-sky-500 hover:text-sky-600 text-xs sm:text-sm font-medium mb-1.5 inline-flex items-center gap-1">
            ← Back to Classroom
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Daily Attendance</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Class: <span className="font-semibold text-slate-700">{level.name}</span></p>
        </div>

        <div className="bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-100 sm:border-0 flex justify-between sm:block items-center">
          <p className="text-xs font-medium text-slate-400">Today's Date</p>
          <p className="text-xs sm:text-base font-bold text-slate-700">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Form Absensi Responsive */}
      <form action={simpanAbsensi} className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {level.siswas.map((siswa, index) => {
            const todayStatus = siswa.absensi[0]?.status;

            return (
              <div key={siswa.id} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 sm:p-4 border border-slate-100 rounded-xl bg-slate-50/80 hover:bg-slate-100/50 transition-colors gap-3">
                
                {/* Informasi Siswa */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{siswa.user.name}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-mono">ID: {siswa.user.username}</p>
                  </div>
                </div>

                {/* Tombol Opsi Radio (Grid 4 Kolom Rata & Rapi di HP) */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full md:w-auto">
                  
                  <label className="cursor-pointer text-center">
                    <input 
                      type="radio" 
                      name={`status_${siswa.id}`} 
                      value="HADIR" 
                      defaultChecked={todayStatus === "HADIR"}
                      className="peer sr-only" 
                      required 
                    />
                    <div className="w-full px-1.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-200 text-slate-500 peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500 transition-all text-center">
                      Present
                    </div>
                  </label>

                  <label className="cursor-pointer text-center">
                    <input 
                      type="radio" 
                      name={`status_${siswa.id}`} 
                      value="IZIN" 
                      defaultChecked={todayStatus === "IZIN"}
                      className="peer sr-only" 
                      required 
                    />
                    <div className="w-full px-1.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-200 text-slate-500 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition-all text-center">
                      Excused
                    </div>
                  </label>

                  <label className="cursor-pointer text-center">
                    <input 
                      type="radio" 
                      name={`status_${siswa.id}`} 
                      value="SAKIT" 
                      defaultChecked={todayStatus === "SAKIT"}
                      className="peer sr-only" 
                      required 
                    />
                    <div className="w-full px-1.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-200 text-slate-500 peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500 transition-all text-center">
                      Sick
                    </div>
                  </label>

                  <label className="cursor-pointer text-center">
                    <input 
                      type="radio" 
                      name={`status_${siswa.id}`} 
                      value="ALPA" 
                      defaultChecked={todayStatus === "ALPA"}
                      className="peer sr-only" 
                      required 
                    />
                    <div className="w-full px-1.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-200 text-slate-500 peer-checked:bg-rose-500 peer-checked:text-white peer-checked:border-rose-500 transition-all text-center">
                      Unexcused
                    </div>
                  </label>

                </div>
              </div>
            );
          })}
        </div>

        {/* Tombol Simpan Full-width di HP */}
        <div className="flex justify-end pt-3 sm:pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            className="w-full sm:w-auto px-8 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-md shadow-sky-200 hover:bg-sky-600 transition-colors text-sm sm:text-base"
          >
            Save Attendance
          </button>
        </div>
      </form>
    </div>
  );
}