import Sidebar from '../components/Sidebar'

export default function Planning() {
  return (
      <div className='flex'>
            <Sidebar />

                  <main className='flex-1 p-8'>
                          <h1 className='text-3xl font-bold mb-6'>Planning Process</h1>

                                  <div className='bg-white p-6 rounded-xl shadow'>
                                            <div className='space-y-4'>
                                                        <div>
                                                                      <input type='checkbox' checked readOnly /> Booking Gedung
                                                                                  </div>

                                                                                              <div>
                                                                                                            <input type='checkbox' /> Fitting Baju
                                                                                                                        </div>
                                                                                                                                  </div>
                                                                                                                                          </div>
                                                                                                                                                </main>
                                                                                                                                                    </div>
                                                                                                                                                      )
                                                                                                                                                      }