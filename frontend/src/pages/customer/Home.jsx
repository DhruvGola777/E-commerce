import MainBanner from '../../components/customer/MainBanner.jsx'
import Categories from '../../components/customer/Categories.jsx'
import BestSeller from '../../components/customer/BestSeller'
import ProductCard from '../../components/customer/ProductCard.jsx'
import BottomBanner from '../../components/customer/BottomBanner'
import NewsLetter from '../../components/customer/NewsLetter'

const Home = () => {
  return (
    <div className='mt-10'>
      <MainBanner/>
      <Categories/>
      <BestSeller/>
      <ProductCard/>
      <BottomBanner/>
      <NewsLetter/>
    </div>
  )
}

export default Home
