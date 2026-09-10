import type { ProductCategory } from './product-category'

export interface Product {
    id: number
    product_category_id: number
    name: string
    image?: string | null
    price: number
    stock: number
    category?: ProductCategory
}
