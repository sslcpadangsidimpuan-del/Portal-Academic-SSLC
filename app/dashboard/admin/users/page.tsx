import { prisma } from "@/lib/db";
import AddUserForm from "./AddUserForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ManageUsersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const activeTab = rawTab === "SISWA" ? "SISWA" : "GURU";

  const levels = await prisma.level.findMany({
    orderBy: { name: 'asc' }
  });

  const users = await prisma.user.findMany({
    where: {
      role: activeTab
    },
    include: {
      siswaProfile: { 
        include: { 
          levels: true 
        } 
      },
      guruProfile: { include: { levels: true } } 
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Add a new teacher or student.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AddUserForm levels={levels} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">List of Registered Users</h2>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                  Total {activeTab === "GURU" ? "Guru" : "Siswa"}: {users.length}
                </span>
              </div>

              <div className="flex space-x-6 border-b border-slate-200">
                <Link 
                  href="?tab=GURU"
                  className={`pb-3 font-semibold text-sm transition-colors ${
                    activeTab === 'GURU' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  👩‍🏫 Teacher List
                </Link>
                <Link 
                  href="?tab=SISWA"
                  className={`pb-3 font-semibold text-sm transition-colors ${
                    activeTab === 'SISWA' 
                      ? 'text-sky-600 border-b-2 border-sky-600' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  👦 Student List
                </Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-100 text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold">Name & Username</th>
                    
                    {activeTab === "GURU" ? (
                      <th className="p-4 font-semibold">Assigned to</th>
                    ) : (
                      <>
                        <th className="p-4 font-semibold">Class & Profile</th>
                        <th className="p-4 font-semibold">Parent / Guardian Data</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400">
                        No data available {activeTab === "GURU" ? "Guru" : "Siswa"}.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const sp = user.siswaProfile;
                      
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 align-top">
                            <p className="font-bold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.username}</p>
                            
                            {activeTab === "SISWA" && sp && (
                              <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                                {sp.gender && <p>Gender : {sp.gender}</p>}
                                {sp.schoolOrigin && <p>School Origin : {sp.schoolOrigin}</p>}
                              </div>
                            )}
                          </td>
                          
                          {activeTab === "GURU" ? (
                            <td className="p-4 align-top">
                              {user.guruProfile && user.guruProfile.levels.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.guruProfile.levels.map(l => (
                                    <span key={l.id} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold border border-indigo-100">
                                      {l.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-xs">Not yet assigned to a class</span>
                              )}
                            </td>
                          ) : (
                            <>
                              <td className="p-4 align-top text-xs space-y-1">
                                {sp?.levels && sp.levels.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mb-1">
                                    {sp.levels.map((lvl: any) => (
                                      <span key={lvl.id} className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md font-bold border border-sky-100 inline-block">
                                        {lvl.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic block mb-1">Has not entered the class yet</span>
                                )}

                                {sp?.dateOfBirth && (
                                  <p className="text-slate-600">
                                    Date of Birth : {new Date(sp.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                                {sp?.religion && <p className="text-slate-500">Religion : {sp.religion}</p>}
                                {sp?.address && <p className="text-slate-500 truncate max-w-[150px]" title={sp.address}>Address : {sp.address}</p>}
                              </td>

                              <td className="p-4 align-top text-xs space-y-1">
                                {(sp?.fatherName || sp?.motherName) ? (
                                  <div className="space-y-0.5">
                                    {sp.fatherName && <p><span className="text-slate-400">Father:</span> <span className="font-semibold text-slate-700">{sp.fatherName}</span> {sp.fatherOccupation ? `(${sp.fatherOccupation})` : ''}</p>}
                                    {sp.motherName && <p><span className="text-slate-400">Mother:</span> <span className="font-semibold text-slate-700">{sp.motherName}</span> {sp.motherOccupation ? `(${sp.motherOccupation})` : ''}</p>}
                                    {sp.parentPhone && <p className="text-emerald-600 font-semibold mt-1">Phone Number : {sp.parentPhone}</p>}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">No parental data available</span>
                                )}

                                {sp?.guardianName && (
                                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                    <p><span className="text-slate-400">Guardian's :</span> {sp.guardianName}</p>
                                    {sp.guardianPhone && <p>Telephone Number {sp.guardianPhone}</p>}
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}