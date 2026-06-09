import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  return (
      <div className='flex'>
            <Sidebar />

                  <main className='flex-1 p-8 bg-gray-50 min-h-screen'>
                          <h1 className='text-3xl font-bold mb-6'>Dashboard Wedding</h1>

                                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                            <div className='bg-white p-6 rounded-xl shadow'>
                                                        <h3>Total Budget</h3>
                                                                    <p className='text-2xl font-bold text-pink-600'>Rp 120.000.000</p>
                                                                              </div>

                                                                                        <div className='bg-white p-6 rounded-xl shadow'>
                                                                                                    <h3>Progress</h3>
                                                                                                                <p className='text-2xl font-bold text-green-600'>75%</p>
                                                                                                                          </div>

                                                                                                                                    <div className='bg-white p-6 rounded-xl shadow'>
                                                                                                                                                <h3>Total Guests</h3>
                                                                                                                                                            <p className='text-2xl font-bold text-blue-600'>350</p>
                                                                                                                                                                      </div>
                                                                                                                                                                              </div>
                                                                                                                                                                                    </main>
                                                                                                                                                                                        </div>
                                                                                                                                                                                          )
                                                                                                                                                                                          }