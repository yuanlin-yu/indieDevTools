<template>
  <Transition name="modal-fade">
    <div 
      v-if="show"
      class="fixed inset-0 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div 
        :class="[
          'relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] px-6 py-4 w-full max-w-sm border border-stone-200/60 overflow-hidden transform transition-all duration-400 origin-center',
          isClosing ? 'scale-x-0 opacity-0 blur-xs ease-pinch' : '',
          cardMounted ? 'scale-x-100 opacity-100 ease-expand-x' : 'scale-x-0 opacity-0'
        ]"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl animate-bounce-gentle">⚡</span>
            <div>
              <h1 class="text-sm font-bold text-stone-800 leading-tight">Thanks your support</h1>
              <p class="text-[11px] text-stone-400">Secure instant payment</p>
            </div>
          </div>
          <button
            @click="handleClose"
            class="w-6 h-6 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md flex items-center justify-center transition-all duration-200 text-xs hover:rotate-90"
          >
            ✕
          </button>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-4 animate-fade-in gap-2">
          <div class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#8ACF00]/30 border-t-[#8ACF00]"></div>
          <p class="text-[11px] text-stone-400 font-medium">Connecting to Stripe...</p>
        </div>

        <div v-if="!paid" :class="[loading ? 'hidden' : 'block']">
          
          <div class="bg-stone-50/60 border border-stone-200/80 rounded-xl px-3 py-3 shadow-inner focus-within:border-[#8ACF00] focus-within:ring-2 focus-within:ring-[#8ACF00]/10 transition-colors">
            <div ref="cardRef" class="w-full"></div>
          </div>
          
          <div class="mt-3">
            <button
              :disabled="isPaying"              
              @click="onPay"
              class="relative w-full py-2.5 bg-[#8ACF00] hover:bg-[#76b000] disabled:bg-stone-300 text-white text-xs font-semibold rounded-xl shadow-md shadow-[#8ACF00]/10 hover:shadow-lg hover:shadow-[#76b000]/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
            >
              <div class="flex items-center justify-center gap-2">
                <span 
                  v-if="isPaying" 
                  class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white shrink-0"
                ></span>
                <span class="truncate w-auto">
                  {{ isPaying ? 'Processing...' : `Pay $${amount.toFixed(2)}` }}
                </span>
              </div>
            </button>
          </div>

          <div v-if="error" class="mt-2.5 p-2 bg-red-50 text-red-600 text-[11px] rounded-lg border border-red-100 text-center font-medium animate-shake">
            ⚠️ {{ error }}
          </div>
        </div>

        <div v-else class="py-3 text-center animate-pop">
          <div class="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-500 text-lg rounded-full mb-1 shadow-inner">
            ✓
          </div>
          <h2 class="text-emerald-600 text-sm font-bold">Thank You!</h2>
          <p class="text-stone-400 text-[11px] mt-0.5">Your payment was processed successfully.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { loadStripe, type Stripe, type StripeCardElement, type StripeElements } from '@stripe/stripe-js';

const props = defineProps<{
  price: number;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', data: any): void;
  (e: 'fail', reason: string): void;
}>();

const config = useRuntimeConfig();
const stripePromise = loadStripe(config.public.stripePublishableKey);

const cardRef = ref<HTMLElement | null>(null);
const error = ref('');
const amount = ref(props.price || 1.0);
const paid = ref(false);
const loading = ref(true);
const isPaying = ref(false);
const isClosing = ref(false); 

let stripe: Stripe | null = null;
let elements: StripeElements | null = null;
let card: StripeCardElement | null = null;
const cardMounted = ref(false);

function handleKeyEnter(e: KeyboardEvent) {
  if (e.key !== 'Enter') return;
  if (loading.value || isPaying.value || paid.value || isClosing.value) return;
  e.preventDefault();
  e.stopPropagation();
  onPay();
}
function bindKeyEvent() {
  window.addEventListener('keydown', handleKeyEnter);
}
function unbindKeyEvent() {
  window.removeEventListener('keydown', handleKeyEnter);
}

watch(() => props.price, (newPrice) => { amount.value = newPrice; });

watch(() => props.show, async (val) => {
  if (val) {
    isClosing.value = false;
    paid.value = false;
    error.value = '';
    loading.value = true;
    await mountCardIfNeeded();
    loading.value = false;
    bindKeyEvent();
  } else {
    unbindKeyEvent();
    cardMounted.value = false;
    unmountAndDestroyCard();
  }
});

async function mountCardIfNeeded() {
  await nextTick();
  if (cardMounted.value) return;

  if (!stripe) {
    stripe = await stripePromise;
    if (!stripe) { error.value = 'Stripe configuration missing'; return; }
  }

  if (!elements) elements = stripe.elements();
  if (!cardRef.value) return;

  try {
    if (!card) {
      card = elements.create('card', {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: '14px',
            color: '#1c1917',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            '::placeholder': { color: '#a8a29e' }
          }
        }
      });
      card.on('change', (ev: any) => { error.value = ev.error ? ev.error.message ?? '' : ''; });
    }
    card.mount(cardRef.value);
    
    setTimeout(() => {
      cardMounted.value = true;
    }, 50);
  } catch (e) {
    error.value = 'Failed to load interface element';
  }
}

function unmountAndDestroyCard() {
  try { if (card) { card.destroy(); card = null; } } finally { cardMounted.value = false; }
}

onMounted(async () => {
  if (props.show) {
    loading.value = true;    
    await mountCardIfNeeded();
    loading.value = false;
    bindKeyEvent(); 
  }
});

onBeforeUnmount(() => { 
  unbindKeyEvent();
  unmountAndDestroyCard(); 
});

async function onPay() {
  if (isPaying.value) return;
  error.value = '';
  if (!stripe || !card) { error.value = 'Payment engine not ready.'; return; }

  isPaying.value = true;
  const cents = Math.round(amount.value * 100);
  let clientSecret: string | undefined;

  try {
    const res = await $fetch('/api/create-payment-intent', { method: 'POST', body: { amount: cents } });
    clientSecret = (res as any).clientSecret as string;
  } catch (e: any) {
    error.value = e?.message ?? 'Session creation failed';
    isPaying.value = false;
    return;
  }

  const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret!, {
    payment_method: { card }
  });

  isPaying.value = false;

  if (confirmError) {
    error.value = confirmError.message ?? 'Transaction failed';
    emit('fail', error.value);
    return;
  }

  if (paymentIntent && paymentIntent.status === 'succeeded') {
    paid.value = true;
    emit('success', paymentIntent);
    
    setTimeout(() => { handleClose(); }, 1200);
  }
}

function handleClose() {
  isClosing.value = true;
  unbindKeyEvent(); 
  setTimeout(() => {
    unmountAndDestroyCard();
    emit('close');
  }, 400);
}
</script>

<style scoped>
.ease-expand-x {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.35s ease;
}
.ease-pinch {
  transition-timing-function: cubic-bezier(0.6, -0.28, 0.735, 0.045);
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
.animate-bounce-gentle {
  animation: bounceGentle 2s infinite ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes pop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-pop {
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.15s ease-in-out 2;
}
</style>