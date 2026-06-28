// server/api/create-payment-intent.post.ts
import Stripe from 'stripe';
import { useRuntimeConfig } from '#imports';

const runtimeConfig = useRuntimeConfig();

// 注意：Stripe 的 apiVersion 如果由于官方版本有特殊指定，请保持原样；
const stripe = new Stripe(runtimeConfig.stripeSecretKey, { 
  apiVersion: runtimeConfig.stripeApiVersion as any ?? '2026-06-24.dahlia' 
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // body 现在只接收前端传来的 amount (单位：美分)
  const amount = body?.amount;
  const clientId = body?.clientId;    // 改为可选，防止以后其他地方还会传

  // 🚀 核心修改：移除 clientId 的 400 报错强校验
  
  // 构建支付参数
  const paymentParams: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  };

  // 如果前端确实传了 clientId，我们保留作为记录；没传也不影响支付
  if (clientId) {
    paymentParams.metadata = { clientId };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create(paymentParams);
    return { clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    // 捕获 Stripe 官方抛出的异常，方便排查是不是秘钥或者金额（比如金额太小）的问题
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.message || 'Stripe Error' 
    });
  }
});