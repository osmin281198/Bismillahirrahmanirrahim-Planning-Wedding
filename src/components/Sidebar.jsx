import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
      <aside className='w-64 bg-white shadow-lg min-h-screen p-6'>
            <h2 className='text-2xl font-bold text-pink-600 mb-8'>
                    Wedding App
                          </h2>

                                <div className='space-y-3'>
                                        <Link to='/dashboard'>Dashboard</Link>
                                                <Link to='/rab'>RAB</Link>
                                                        <Link to='/planning'>Planning</Link>
                                                                <Link to='/guests'>Guests</Link>
                                                                      </div>
                                                                          </aside>
                                                                            )
                                                                            }