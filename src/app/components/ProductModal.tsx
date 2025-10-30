'use client'
import { useEffect, useState, ChangeEvent } from 'react'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void | Promise<void>; // ✅ дозволяємо async
  mode?: 'create' | 'edit'
  productId?: number
  initialData?: {
    name: string
    price: number
    brand: string
    image?: string
  }
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  mode = 'create',
  productId,
  initialData
}: ProductModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [brand, setBrand] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'create' && isOpen) {
      // Очищаємо всі поля при відкритті модалки для створення нового продукту
      setName('')
      setPrice('')
      setBrand('')
      setImageFile(null)
      setPreview(null)
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setPrice(String(initialData.price))
      setBrand(initialData.brand)
      setPreview(initialData.image || null)
    }
  }, [initialData])

  if (!isOpen) return null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Валідація розміру (макс 2 МБ)
    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Файл занадто великий. Максимум ${maxSizeMB} МБ.`);
      e.target.value = ''; // очищаємо вибір файлу
      setImageFile(null);
      setPreview(null);
      return;
    }

    // ✅ Валідація типу (тільки зображення)
    if (!file.type.startsWith('image/')) {
      alert('Будь ласка, виберіть зображення (jpg, png, gif тощо).');
      e.target.value = '';
      setImageFile(null);
      setPreview(null);
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)
    formData.append('brand', brand)
    if (imageFile) formData.append('image', imageFile)

    try {
      const url = productId ? `/api/products/${productId}` : '/api/products'
      const method = productId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        body: formData
      })

      if (res.ok) {
        onClose()
        setName('')
        setPrice('')
        setBrand('')
        setImageFile(null)
        setPreview(null)

         // 🔹 Викликаємо onSave щоб оновити список продуктів
        if (onSave) onSave()
      } else {
        console.error('Помилка при збереженні продукту:', await res.text())
      }
    } catch (error) {
      console.error('❌ Помилка при збереженні продукту:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {mode === 'edit' ? 'Редагувати продукт' : 'Додати продукт'}
        </h2>
    
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Назва"
            value={name}
            maxLength={191}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Ціна"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border px-3 py-2 rounded"
            required={mode === 'create'}
          />

          {preview && (
            <div className="flex justify-center mt-2">
              <img
                src={preview}
                alt="Прев’ю"
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}

          <select
            onChange={(e) => setBrand(e.target.value)}
            value={brand}
            className="border px-3 py-2 rounded"
          >
            <option value="Xerox">Xerox</option>
            <option value="Panasonic">Panasonic</option>
            <option value="Toshiba">Toshiba</option>
            <option value="Sony">SONY</option>
            <option value="Samsung">SAMSUNG</option>
            <option value="Apple">Apple</option>
            <option value="Dell">Dell</option>
            <option value="LG">LG</option>
            <option value="Asus">Asus</option>
            <option value="Canon">Canon</option>
            <option value="Bose">Bose</option>
            <option value="Xiaomi">Xiaomi</option>
            <option value="HP">HP</option>
            <option value="Google">Google</option>
            <option value="Lenovo">Lenovo</option>
            <option value="JBL">JBL</option>
            <option value="DJI">DJI</option>
            <option value="Razer">Razer</option>
            <option value="Logitech">Logitech</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Anker">Anker</option>
            <option value="Philips">Philips</option>
            <option value="GoPro">GoPro</option>
          </select>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:cursor-pointer rounded hover:bg-gray-300"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white hover:cursor-pointer rounded ${
                mode === 'edit' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {mode === 'edit' ? 'Оновити' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
