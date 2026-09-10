<script setup lang="ts">
import { Button, Column, ConfirmDialog, DataTable, Select, IconField, InputText, InputIcon, useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/stores/product-store';
import { onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core';
import { deleteProduct } from '@/api/products-api';
import { getCategories } from '@/api/product-categories-api';
import type { ProductCategory } from '@/types/product-category';

const productStore = useProductStore();
const { fetch, setLimit, setPage, nextPage, prevPage } = productStore
const { items, loading, limit, currentPage, totalPages, search, product_category_id } = storeToRefs(productStore)

const categories = ref<ProductCategory[]>([])

const confirm = useConfirm()
const toast = useToast()

const fetchCategories = async () => {
    try {
        const res = await getCategories({ limit: 100 })
        categories.value = res.data.data.items
    } catch (error) {
        console.error('Failed to fetch categories:', error)
    }
}

watch(product_category_id, () => {
    productStore.page = 1
    fetch()
})

const onSearch = useDebounceFn(() => {
    setPage(1)
}, 400)

const confirmDelete = (id: number) => {
    confirm.require({
        message: "Are u sure u want to delete this product?",
        header: "Confirm Delete",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
            label: "Cancel",
            severity: "secondary",
            outlined: true
        },
        acceptProps: {
            label: "Delete",
            severity: "danger",
        },
        accept: async () => {
            try {
                await deleteProduct(id)
                toast.add({
                    severity: "success",
                    summary: "Deleted",
                    detail: "Product Removed",
                    life: 3000
                })
                fetch()
            } catch (error) {
                toast.add({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to delete product",
                    life: 3000
                })
                fetch()
            }
        } 
    })
}

const getCategoryName = (id: number | null) => {
    if (!id) return '-';
    const category = categories.value.find(c => c.id === id);
    return category ? category.name : '-';
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value)
}

onMounted(() => {
    fetchCategories()
    fetch()
})
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Products
                </h1>
                <p class="text-surface-500 text-sm">
                    The list here show all products
                </p>
            </div>

            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'products-create' }" :class="slotProps.class">
                    Add Product
                </RouterLink>
            </Button>
        </div>

        <div class="bg-white rounded-2xl border border-surface-200 p-2">
            <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4 w-full">
                <IconField iconPosition="left" class="w-full md:w-80">
                    <InputIcon class="pi pi-search text-surface-400" />
                    <InputText v-model="search" placeholder="Search" @input="onSearch"/>
                </IconField>
                
                <Select v-model="product_category_id" :options="categories" optionLabel="name" optionValue="id"
                    placeholder="All Categories" showClear filter filterPlaceholder="Search Category..." class="w-full md:w-56 bg-surface-50 md:ml-auto" />
            </div>

            <DataTable :value="items" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
                <Column field="name" header="Name" class="min-w-[16rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <img :src="data.image" :alt="data.name" class="w-10 h-10 rounded-full object-cover bg-surface-100">
                            </div>
                            <span class="font-semibold text-surface-900">
                                {{ data.name }}
                            </span>
                        </div>
                    </template>
                </Column>

                <Column header="Category">
                    <template #body="{ data }">
                        {{ data.category?.name || getCategoryName(data.product_category_id) }}
                    </template>
                </Column>

                <Column field="price" header="Price">
                    <template #body="{ data }">
                        {{ formatCurrency(data.price) }}
                    </template>
                </Column>

                <Column field="stock" header="Stock">
                    <template #body="{ data }">
                        <span :class="data.stock <= 0 ? 'text-red-600 font-semibold' : ''">
                            {{ data.stock }}
                        </span>
                    </template>
                </Column>

                <Column header="Actions" style="width: 5rem">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <RouterLink :to="{ name: 'products-edit', params: { id: data.id } }">
                                <Button icon="pi pi-pencil" text rounded severity="primary" 
                                    class="w-9! h-9! border-surface-200! text-surface-200! hover:text-primary-600! hover:border-primary-500 hover:bg-primary-50! bg-white" 
                                    />
                            </RouterLink>

                            <Button icon="pi pi-trash" text rounded severity="danger" 
                                class="w-9! h-9! border-surface-200! text-surface-200! hover:text-primary-600! hover:border-primary-500 hover:bg-primary-50! bg-white" 
                                @click="confirmDelete(data.id)"/>
                        </div>
                    </template>
                </Column>
            </DataTable>

            <div class="flex justify-between items-center px-4 py-4 border-t border-surface-100 gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500">Rows per page:</span>
                    <Select :model-value="limit" :options="[5, 10, 20, 50]" @update:model-value="setLimit" />
                </div>

                <div class="flex items-center gap-4">
                    <span class="text-sm font-medium text-surface-600">
                        {{  currentPage }} of {{  totalPages }}
                    </span>

                    <div class="flex gap-1">
                        <Button icon="pi pi-chevron-left" text rounded severiy="secondary" 
                            :disabled="currentPage === 1" 
                            class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!" @click="prevPage()" />
                        <Button icon="pi pi-chevron-right" text rounded severiy="secondary" 
                            :disabled="currentPage === totalPages" 
                            class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!" @click="nextPage() "/>
                    </div>
                </div>
            </div>
        </div>
    </div> 

    <ConfirmDialog />
</template>
