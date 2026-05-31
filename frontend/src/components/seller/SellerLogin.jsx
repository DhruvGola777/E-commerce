import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const SellerLogin = () => {
    const { isseller, setisseller, navigate, axios } = useAppContext()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const { data } = await axios.post('/api/seller/login', { email, password },{withCredentials :true})
            if (data.success) {
                setisseller(true);
                navigate('/seller')
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(() => {
        if (isseller) {
            navigate("/seller")
        }
    }, [isseller])
    return !isseller && (
        <form onSubmit={handleSubmit} className='min-h-screen flex items-center text-sm text-gray-600'>
            <div className='flex flex-col gap-5 m-auto items-center p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200'>
                <div className='text-2xl font-semibold text-left mb-4 w-full'>
                    <span className='text-primary'>
                        Seller
                    </span>
                    Login
                    <div className='w-full'>
                        <label className='block text-gray-600 text-sm font-medium mb-1'></label>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary' required placeholder='Enter your email' />
                    </div>
                    <div className='w-full'>
                        <p>Password</p>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary' required placeholder='Enter your password' />
                    </div>
                    <button className='bg-primary text-white w-full py-2 rounded-md cursor-pointer'>
                        Login
                    </button>
                </div>
            </div>
        </form>
    )
}

export default SellerLogin
