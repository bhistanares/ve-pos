<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getTransaction } from '@/api/transactions-api'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'

const route = useRoute()
const id = Number(route.params.id)
const transaction = ref<any>(null)
const loading = ref(false)
const toast = useToast()

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date).replace('.', ':')
  
  return `${formattedDate} pukul ${formattedTime}`
}

const fetch = async () => {
  loading.value = true
  try {
    const res = await getTransaction(id)
    transaction.value = res.data?.data || res.data
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch transaction' })
  } finally {
    loading.value = false
  }
}

onMounted(fetch)
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Transaction Detail</h1>
        <p class="text-surface-500 text-sm">View transaction information</p>
      </div>

        <Button asChild v-slot="slotProps">
            <RouterLink :to="{ name: 'transactions' }" :class="slotProps.class">
                <i class="pi pi-arrow-left"></i>
                Back
            </RouterLink>
        </Button>
    </div>

    <div v-if="transaction" class="space-y-6">
      <!-- Transaction Information Card -->
      <div class="bg-white rounded-2xl border border-surface-200 p-6">
        <h3 class="font-bold text-lg mb-4 text-surface-900">Transaction Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div class="text-sm text-surface-500 mb-1">Transaction Code</div>
            <div class="font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded inline-block break-all">{{ transaction.code }}</div>
          </div>

          <div>
            <div class="text-sm text-surface-500 mb-1">Customer</div>
            <div class="font-semibold text-surface-900">{{ transaction.customer?.name || '-' }}</div>
          </div>

          <div>
            <div class="text-sm text-surface-500 mb-1">Date</div>
            <div class="font-semibold text-surface-900">{{ formatDate(transaction.created_at) }}</div>
          </div>

          <div>
            <div class="text-sm text-surface-500 mb-1">Total</div>
            <div class="font-semibold text-primary-600 text-lg">{{ formatCurrency(transaction.total || 0) }}</div>
          </div>
        </div>
      </div>

      <!-- Items Card -->
      <div class="bg-white rounded-2xl border border-surface-200 p-6">
        <h3 class="font-bold text-lg mb-4 text-surface-900">Items</h3>
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="text-left border-b border-surface-200 text-surface-700 font-bold text-sm">
              <th class="pb-3">Product</th>
              <th class="pb-3">Price</th>
              <th class="pb-3">Qty</th>
              <th class="pb-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in transaction.items || []" :key="item.id" class="border-b border-surface-100 last:border-none">
              <td class="py-4 font-semibold text-surface-900">{{ item.product?.name || item.name || '-' }}</td>
              <td class="py-4 text-surface-700">{{ formatCurrency(item.price || 0) }}</td>
              <td class="py-4 text-surface-700">{{ item.quantity }}</td>
              <td class="py-4 font-semibold text-surface-900">{{ formatCurrency((item.price || 0) * (item.quantity || 1)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Card -->
      <div class="bg-white rounded-2xl border border-surface-200 p-6">
        <h3 class="font-bold text-lg mb-4 text-surface-900">Summary</h3>
        <div class="flex flex-col items-end gap-3 w-full">
          <div class="flex justify-between w-full md:w-72 text-sm">
            <span class="text-surface-500">Subtotal</span>
            <span class="font-semibold text-surface-900">{{ formatCurrency(transaction.subtotal || 0) }}</span>
          </div>

          <div class="flex justify-between w-full md:w-72 text-sm">
            <span class="text-surface-500">Tax</span>
            <span class="font-semibold text-surface-900">{{ formatCurrency(transaction.tax || 0) }}</span>
          </div>

          <div class="flex justify-between w-full md:w-72 text-base border-t border-surface-200 pt-3">
            <span class="font-bold text-surface-900">Total</span>
            <span class="font-bold text-lg text-primary-600">{{ formatCurrency(transaction.total || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-2xl border border-surface-200 p-12 text-center text-surface-500">
      Loading...
    </div>
  </div>
</template>