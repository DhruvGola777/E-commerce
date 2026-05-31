import { Route, Routes, useLocation } from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import Navbar from './components/customer/Navbar'
import Footer from './components/customer/Footer'
import Login from './components/customer/Login'
import SellerLogin from './components/seller/SellerLogin'
import Home from './pages/customer/Home'
import Cart from './pages/customer/Cart'
import AllProducts from './pages/customer/AllProducts'
import ProductCategory from './pages/customer/ProductCategory'
import ProductDetails from './pages/customer/ProductDetails'
import AddAddress from './pages/customer/AddAddress'
import MyOrders from './pages/customer/MyOrders'
import SellerLayout from './pages/seller/SellerLayout'
import AddProduct from './pages/seller/AddProduct'
import ProductList from './pages/seller/ProductList'
import Orders from './pages/seller/Orders'
import { useAppContext } from './context/AppContext'
import Loading from './components/customer/Loading'
const App = () => {

  const isSellerPath=useLocation().pathname.includes("seller");
  const {showUserLogin,isseller}=useAppContext();
  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {isSellerPath?null:<Navbar/>}
      {showUserLogin? <Login/>:null}
      <Toaster/>
      <div className={`${isSellerPath?"":"px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/products' element={<AllProducts/>}/>
          <Route path='/products/:category' element={<ProductCategory/>}/>
          <Route path='/products/:category/:id' element={<ProductDetails/>}/>
          <Route path='/cart' element={<Cart/>}/>
          <Route path='/add-address' element={<AddAddress/>}/>
          <Route path='/my-order' element={<MyOrders/>}/>
          <Route path='/loader' element={<Loading/>}/>
          <Route path='/seller' element={isseller ? <SellerLayout/>:<SellerLogin/>}>
          <Route index element={isseller ? <AddProduct/>:null}/>
          <Route path='product-list' element={<ProductList/>}/>
          <Route path='orders' element={<Orders/>}/>
          </Route>
        </Routes>
      </div>
      {!isSellerPath && <Footer/>}
    </div>
  )
}

export default App
