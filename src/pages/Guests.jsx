import Sidebar from '../components/Sidebar'

export default function Guests() {
  return (
      <div className='flex'>
            <Sidebar />

                  <main className='flex-1 p-8'>
                          <h1 className='text-3xl font-bold mb-6'>Data Tamu</h1>

                                  <div className='bg-white rounded-xl shadow overflow-hidden'>
                                            <table className='w-full'>
                                                        <thead className='bg-gray-50'>
                                                                      <tr>
                                                                                      <th className='p-4 text-left'>Nama</th>
                                                                                                      <th className='p-4 text-left'>Kategori</th>
                                                                                                                      <th className='p-4 text-left'>Undangan</th>
                                                                                                                                    </tr>
                                                                                                                                                </thead>

                                                                                                                                                            <tbody>
                                                                                                                                                                          <tr>
                                                                                                                                                                                          <td className='p-4'>Budi Santoso</td>
                                                                                                                                                                                                          <td className='p-4'>Keluarga</td>
                                                                                                                                                                                                                          <td className='p-4'>
                                                                                                                                                                                                                                            <a
                                                                                                                                                                                                                                                                href='/invitation/budi-santoso'
                                                                                                                                                                                                                                                                                    className='text-blue-600'
                                                                                                                                                                                                                                                                                                      >
                                                                                                                                                                                                                                                                                                                          Lihat
                                                                                                                                                                                                                                                                                                                                            </a>
                                                                                                                                                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                                                                                                                                                                          </tr>
                                                                                                                                                                                                                                                                                                                                                                                      </tbody>
                                                                                                                                                                                                                                                                                                                                                                                                </table>
                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                              </main>
                                                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                                                    )
                                                                                                                                                                                                                                                                                                                                                                                                                    }