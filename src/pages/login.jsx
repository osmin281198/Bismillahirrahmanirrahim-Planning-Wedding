import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

    const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')

        const handleLogin = (e) => {
            e.preventDefault()

                if (email === 'pengantin@gmail.com') {
                      localStorage.setItem('role', 'pengantin')
                          } else {
                                localStorage.setItem('role', 'keluarga')
                                    }

                                        navigate('/dashboard')
                                          }

                                            return (
                                                <div className='min-h-screen flex items-center justify-center bg-pink-50'>
                                                      <form
                                                              onSubmit={handleLogin}
                                                                      className='bg-white p-8 rounded-2xl shadow-xl w-full max-w-md'
                                                                            >
                                                                                    <h1 className='text-3xl font-bold text-center mb-6 text-pink-600'>
                                                                                              Wedding Login
                                                                                                      </h1>

                                                                                                              <input
                                                                                                                        type='email'
                                                                                                                                  placeholder='Email'
                                                                                                                                            value={email}
                                                                                                                                                      onChange={(e) => setEmail(e.target.value)}
                                                                                                                                                                className='w-full border p-3 rounded-lg mb-4'
                                                                                                                                                                        />

                                                                                                                                                                                <input
                                                                                                                                                                                          type='password'
                                                                                                                                                                                                    placeholder='Password'
                                                                                                                                                                                                              value={password}
                                                                                                                                                                                                                        onChange={(e) => setPassword(e.target.value)}
                                                                                                                                                                                                                                  className='w-full border p-3 rounded-lg mb-4'
                                                                                                                                                                                                                                          />

                                                                                                                                                                                                                                                  <button className='w-full bg-pink-600 text-white py-3 rounded-lg'>
                                                                                                                                                                                                                                                            Login
                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                          </form>
                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                )
                                                                                                                                                                                                                                                                                }