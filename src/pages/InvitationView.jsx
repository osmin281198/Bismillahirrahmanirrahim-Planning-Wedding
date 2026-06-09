import { useParams } from 'react-router-dom'

export default function InvitationView() {
  const { slug } = useParams()

    const guestName = slug.replace(/-/g, ' ')

      return (
          <div className='min-h-screen flex items-center justify-center bg-stone-100'>
                <div className='bg-white p-10 rounded-2xl shadow-xl text-center'>
                        <h1 className='text-4xl mb-4'>Arif & Fitri</h1>

                                <p className='mb-6'>Kepada Yth:</p>

                                        <h2 className='text-2xl text-pink-600 capitalize'>
                                                  {guestName}
                                                          </h2>
                                                                </div>
                                                                    </div>
                                                                      )
                                                                      }