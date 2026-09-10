import { getProducts } from "@/api/products-api"
import type { Product } from "@/types/product"
import { defineStore } from "pinia"

export const useProductStore = defineStore('product', {
    state: ()=> ({
        items: [] as Product[],
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
            from: 0,
            to: 0
        },
        page: 1,
        limit: 10,
        search: '',
        product_category_id: null as number | null,
        loading: false
    }),

    getters: {
        currentPage: (state) => state.pagination.current_page || 1,
        totalPages: (state) => state.pagination.last_page || 1
    },

    actions: {
        async fetch(){
            this.loading = true

            try{
                const params: Record<string, any> = {
                    page: this.page,
                    limit: this.limit
                }
                
                if (this.search) {
                    params.search = this.search
                }
                
                if (this.product_category_id) {
                    params.product_category_id = this.product_category_id
                }

                const res = await getProducts(params)

                this.items = res.data.data.items
                this.pagination = res.data.data.pagination
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                this.loading = false 
            }
        },

        setPage(page: number) {
            this.page = page
            this.fetch()
        },
        
        setLimit(limit: number){
            this.limit = limit
            this.page = 1
            this.fetch()
        },

        nextPage() {
            if(this.pagination.current_page < this.pagination.last_page){
                this.page = this.pagination.current_page + 1
                this.fetch()
            }
        },

        prevPage() {
            if(this.pagination.current_page > 1){
                this.page = this.pagination.current_page - 1
                this.fetch()
            }
        }
    }
})
