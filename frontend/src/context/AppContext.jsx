import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

export const AppContext = createContext();
export const AppContextProvider = ({ children }) => {

    const currency = "₹";
    const backendUrl = "http://localhost:4000";
    const navigate = useNavigate();
    const [user, setuser] = useState(null);
    const [isseller, setisseller] = useState(false);
    const [showUserLogin, setshowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    axios.defaults.baseURL = backendUrl;
    axios.defaults.withCredentials = true;

    const FetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/list')
            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const FetchSeller = async () => {
        try {
            const { data } = await axios.get('/api/seller/is-auth')
            if (data.success) {
                setisseller(true)
            } else {
                setisseller(false)
            }
        } catch (error) {
            setisseller(false)
        }
    }
    const FetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/is-auth');
            if (data.success) {
                setuser(data.user)
                setCartItems(data.user.cartItems)
            } else {
                setuser(null)
            }
        } catch (error) {

        }
    }
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1
        }
        setCartItems(cartData);
        toast.success("Added To Cart")
    }
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData);
        toast.success("Cart Upadated")
    }
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId]
            }
        }
        setCartItems(cartData);
        toast.success("Remove from cart")
    }
    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            totalCount += cartItems[item]
        }
        return totalCount;
    }
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0 && itemInfo) {
                totalAmount += itemInfo.offerPrice * cartItems[items]
            }
        }
        return Math.floor((totalAmount * 100) / 100)
    }
    useEffect(() => {
        FetchSeller();
        FetchProducts();
        FetchUser();
    }, [])
    useEffect(() => {
        const updateCart = async () => {
            try {
                const {data}=await axios.post('/api/cart/update',{cartItems});
                if(!data.success){
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
        if(user){
            updateCart();
        }
    }, [cartItems])

    const value = { navigate, user, setuser, isseller, setisseller, showUserLogin, setshowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartCount, getCartAmount, axios, backendUrl, FetchProducts, setCartItems}

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}
export const useAppContext = () => {
    return useContext(AppContext)
}