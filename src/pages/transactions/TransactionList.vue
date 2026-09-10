<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DataTable, Column, Button, InputText, InputIcon, IconField } from 'primevue'
import { useDebounceFn } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'
import { getTransactions } from '@/api/transactions-api'
import { RouterLink } from 'vue-router'
import Select from 'primevue/select'

const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const toast = useToast()

const setLimit = (val: number) => {
  limit.value = val
  page.value = 1
  fetch()
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date).replace(',', '')
}

const fetch = async () => {
  loading.value = true
  try {
    const res = await getTransactions({ page: page.value, search: search.value, limit: limit.value })
    const payload = res.data?.data || res.data
    items.value = payload.items || payload || []
    const meta = payload.meta || payload.pagination || {}
    totalPages.value = meta.last_page || Math.ceil((meta.total || items.value.length) / (meta.per_page || limit.value)) || 1
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch transactions' })
  } finally {
    loading.value = false
  }
}

const onSearch = useDebounceFn(() => {
  page.value = 1
  fetch()
}, 400)

onMounted(fetch)
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Transactions</h1>
        <p class="text-surface-500 text-sm">The list here shows all transactions</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 p-2">
      <div class="flex items-center px-4 py-4 gap-4 w-full">
        <IconField iconPosition="left" class="w-full md:w-80">
          <InputIcon class="pi pi-search text-surface-400" />
          <InputText v-model="search" placeholder="Search by code..." @input="onSearch" />
        </IconField>
      </div>

      <DataTable :value="items" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
        <Column field="code" header="Code" class="min-w-12rem">
          <template #body="{ data }">
            <span class="font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">{{ data.code }}</span>
          </template>
        </Column>

        <Column header="Customer">
          <template #body="{ data }">
            {{ data.customer?.name || '-' }}
          </template>
        </Column>

        <Column field="total" header="Total">
          <template #body="{ data }">
            {{ formatCurrency(data.total || 0) }}
          </template>
        </Column>

        <Column header="Date">
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
          </template>
        </Column>

        <Column header="Actions" style="width: 6rem">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <RouterLink :to="{ name: 'transactions-detail', params: { id: data.id } }">
                <Button icon="pi pi-eye" text rounded severity="secondary"
                  class="w-9! h-9! border-surface-200! text-surface-400! bg-white hover:bg-surface-50!" />
              </RouterLink>
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
          <span class="text-sm font-medium text-surface-600">1 of {{ totalPages }}</span>
          <div class="flex gap-1">
            <Button icon="pi pi-chevron-left" text rounded :disabled="page === 1" @click="page = Math.max(1, page - 1); fetch()" />
            <Button icon="pi pi-chevron-right" text rounded :disabled="page === totalPages" @click="page = Math.min(totalPages, page + 1); fetch()" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>