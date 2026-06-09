import Sidebar from '../components/Sidebar'

export default function Rab() {
  return (
      <div className='flex'>
            <Sidebar />

                  <main className='flex-1 p-8'>
                          <h1 className='text-3xl font-bold mb-6'>RAB Pernikahan</h1>

                                  <div className='bg-white rounded-xl shadow overflow-hidden'>
                                            <table className='w-full'>
                                                        <thead className='bg-pink-50'>
                                                                      <tr>
                                                                                      <th className='p-4 text-left'>Item</th>
                                                                                                      <th className='p-4 text-left'>Budget</th>
                                                                                                                      <th className='p-4 text-left'>Terpakai</th>
                                                                                                                                    </tr>
                                                                                                                                                </thead>

                                                                                                                                                            <tbody>
                                                                                                                                                                          <tr>
                                                                                                                                                                                          <td className='p-4'>Gedung</td>
                                                                                                                                                                                                          <td className='p-4'>Rp 50.000.000</td>
                                                                                                                                                                                                                          <td className='p-4'>Rp 45.000.000</td>
                                                                                                                                                                                                                                        </tr>
                                                                                                                                                                                                                                                    </tbody>
                                                                                                                                                                                                                                                              </table>
                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                            </main>
                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                  )
                                                                                                                                                                                                                                                                                  }