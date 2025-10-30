'use client'
import Image from "next/image";
import { useState, useEffect } from 'react'
import ProductModal from './components/ProductModal'
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  image: string
  price: number
  brand: string
}

export default function Home() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const [metod, setMetod] = useState<'create' | 'edit'>('create')
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [search, setSearch] = useState('');

  const removeProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Не вдалося видалити продукт');
      }

      const data = await res.json();
      console.log(data.message);

      // 🔹 Оновлюємо список після видалення
      fetchProducts(page);

    } catch (error) {
      console.error(error);
      alert('Помилка при видаленні продукту');
    }
  };
  const resetFilter = () => {
    // Скидаємо всі фільтри
    const empty = '';
    setMinPrice(empty);
    setMaxPrice(empty);
    setBrand(empty);
    setSearch(empty);

    // Скидаємо сторінку на першу
    setPage(1);

    // Викликаємо fetchProducts з порожніми фільтрами
    fetchProducts(1, empty, empty, empty, empty);
  };
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
    setMetod('edit')
  }
  const handleCreateClick = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
    setMetod('create')
  }

  const fetchProducts = async (
    pageNumber: number,
    minPriceVal: string = minPrice,
    maxPriceVal: string = maxPrice,
    brandVal: string = brand,
    searchVal: string = search
  ) => {
    let url = `/api/products?page=${pageNumber}&limit=5`;

    if (minPriceVal) url += `&minPrice=${minPriceVal}`;
    if (maxPriceVal) url += `&maxPrice=${maxPriceVal}`;
    if (brandVal) url += `&brand=${brandVal}`;
    if (searchVal) url += `&search=${searchVal}`;

    const res = await fetch(url);
    const data = await res.json();
    setProducts(data.data);
    setTotalPages(data.totalPages);
  };


  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  return (
    <div className="ml-[10%] mr-[10%]">
  <main>
    <div className="flex flex-col text-center w-full">
      <h1 className="text-left sm:ml-8 md:ml-10 font-bold text-lg sm:text-xl md:text-2xl mb-4">
        Товари
      </h1>

      {/* Кнопка та фільтри */}
      <div className="flex flex-col sm:flex-row sm:items-center text-left mb-4 gap-2 sm:gap-4">
        <button
          onClick={() => handleCreateClick()}
          className="px-4 py-2 bg-green-600 hover:cursor-pointer text-white rounded-lg hover:bg-green-700"
        >
          + Додати продукт
        </button>

        <div className="flex flex-col sm:flex-row sm:ml-auto gap-2 sm:gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Пошук" 
            value={search}
            className="border px-3 py-2 rounded w-full sm:w-32"
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="number"
            placeholder="Мінімальна ціна"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-32"
          />
          <input
            type="number"
            placeholder="Максимальна ціна"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-32"
          />
          <select
            onChange={(e) => setBrand(e.target.value)}
            value={brand}
            className="border px-3 py-2 rounded w-full sm:w-auto"
          >
            <option value="">Виберіть бренд</option> <option value="Xerox">Xerox</option> <option value="Panasonic">Panasonic</option> <option value="Toshiba">Toshiba</option> <option value="Sony">SONY</option> <option value="Samsung">SAMSUNG</option> <option value="Apple">Apple</option> <option value="Dell">Dell</option> <option value="LG">LG</option> <option value="Asus">Asus</option> <option value="Canon">Canon</option> <option value="Bose">Bose</option> <option value="Xiaomi">Xiaomi</option> <option value="HP">HP</option> <option value="Google">Google</option> <option value="Lenovo">Lenovo</option> <option value="JBL">JBL</option> <option value="DJI">DJI</option> <option value="Razer">Razer</option> <option value="Logitech">Logitech</option> <option value="Microsoft">Microsoft</option> <option value="Anker">Anker</option> <option value="Philips">Philips</option> <option value="GoPro">GoPro</option>
          </select>
          <button
            onClick={() => fetchProducts(page)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            Застосувати
          </button>
          <button
            onClick={() => resetFilter()}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded sm:w-auto hover:cursor-pointer"
          >
            Скинути фільтр
          </button>
        </div>
      </div>

      {/* Таблиця */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 sm:px-4 py-2 text-left">Зображення</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Назва</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Ціна</th>
              <th className="border px-2 sm:px-4 py-2 text-center">Дії</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border px-2 sm:px-4 py-2">
                    <Image src={product.image} alt={product.name} width={100} height={100} />
                  </td>
                  <td className="border px-2 sm:px-4 py-2">{product.name}</td>
                  <td className="border px-2 sm:px-4 py-2">{product.price}</td>
                  <td className="border px-2 sm:px-4 py-2 text-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="text-green-600 hover:cursor-pointer hover:text-green-800 p-1"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-blue-600 hover:cursor-pointer hover:text-blue-800 p-1"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:cursor-pointer hover:text-red-800 p-1"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border px-2 sm:px-4 py-8 text-center text-gray-500">
                  Даних поки немає
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Пагінація */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-3 py-1 hover:cursor-pointer rounded border ${
            page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100'
          }`}
        >
          Попередня
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 hover:cursor-pointer rounded border ${
              page === p ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-3 py-1 hover:cursor-pointer rounded border ${
            page === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100'
          }`}
        >
          Наступна
        </button>
      </div>

      {/* Модалка */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={metod}
        onSave={() => fetchProducts(page)}
        productId={selectedProduct?.id}
        initialData={selectedProduct ?? undefined}
      />
    </div>
  </main>
</div>
  )
}
