# QuickPayModal - Stripe Payment Component for Nuxt
A sleek, responsive, and user-friendly Stripe payment modal component for Nuxt applications, designed to provide a seamless one-click payment experience with modern UI/UX features.

## Demo
![QuickPayModal Demo](quickPayModal.mp4)

## Prerequisites
- A Stripe account (with publishable and secret keys)
- Node.js (16.x or later)
- Nuxt project setup

## Installation
### 1. Install Dependencies
Install the required frontend and backend dependencies:

```bash
# Install Stripe frontend SDK
npm install @stripe/stripe-js

# Install Stripe Node.js SDK (server-side)
npm install stripe
```

### 2. Environment Variables Setup
Create or modify root `.env` file, add Stripe environment variables with NUXT_ prefix:

NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
NUXT_STRIPE_SECRET_KEY=your_stripe_secret_key_here
NUXT_STRIPE_API_VERSION=2026-06-24.dahlia

### 3. nuxt.config.ts Configuration
Fill runtimeConfig as below:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-side private config
    stripeSecretKey: '',
    stripeApiVersion: '',
    public: {
      // Client-side exposed config
      stripePublishableKey: '',
    },
  },
});
```

## Project File Placement

Copy the 3 provided source files to corresponding directories in your Nuxt project:

1. Component modal file: components/quickPayModal.vue
2. Server payment intent api: server/api/create-payment-intent.post.ts

## Basic Usage Example

```ts
<template>
  <!-- Payment trigger button -->
  <button @click="openPayment(1.00)">
    Buy me a coffee - $1.00
  </button>

  <!-- Payment Modal Component -->
  <QuickPayModal 
    :show="isOpen" 
    :price="checkoutPrice"
    @close="isOpen = false"
    @success="onPaymentSuccess"
    @fail="onPaymentFail"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QuickPayModal from '~/components/quickPayModal.vue';

const isOpen = ref(false);
const checkoutPrice = ref(0);

// Open payment modal with target amount
const openPayment = (amount: number) => {
  checkoutPrice.value = amount;
  isOpen.value = true;
};

// Triggered after payment succeeded
const onPaymentSuccess = (paymentIntent: any) => {
  console.log('Payment finished successfully', paymentIntent);
  // Add your business logic here, e.g. order record, user reward
};

// Triggered when payment failed
const onPaymentFail = (errorMsg: string) => {
  console.error('Payment failed', errorMsg);
};
</script>
```

## License
Released under MIT License





