<template>
  <div class="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-6 select-none">
    
    <button 
      @click="openPayment(1.00)"
      class="bg-white rounded-xl px-2 py-2 border border-gray w-[240px] flex items-center justify-center gap-2 hover:scale-105 shadow-lg transition-all"
    >
        <span class="text-sm">☕ Buy me a coffee</span>
        <span class="font-bold bg-white rounded-md border border-stone-200/60 shadow-sm w-auto px-4 py-0.5 text-sm">$1.00</span>
    </button>

    <QuickPayModal 
      :show="isOpen" 
      :price="checkoutPrice"
      @close="isOpen = false"
      @success="onPaymentSuccess"
    />

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QuickPayModal from '~/components/quickPayModal.vue';

const isOpen = ref(false);
const checkoutPrice = ref(0.0);

function openPayment(amount: number) {
  checkoutPrice.value = amount;
  isOpen.value = true;
}

function onPaymentSuccess(paymentIntent: any) {
  console.log('Payment complete:', paymentIntent);
}
</script>