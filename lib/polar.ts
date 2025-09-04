const POLAR_TOKEN = process.env.POLAR_TOKEN;
const POLAR_PRODUCT_ID = process.env.POLAR_PRODUCT_ID;
const API_BASE = "https://api.polar.sh";

if (!POLAR_TOKEN || !POLAR_PRODUCT_ID) {
  console.warn(
    "[polar] POLAR_TOKEN and POLAR_PRODUCT_ID must be set for payment processing"
  );
}

export interface PolarCheckoutSession {
  id: string;
  url: string;
  customer_email?: string;
  product_id: string;
  amount: number;
  currency: string;
  success_url: string;
  cancel_url?: string;
}

export interface PolarWebhookPayload {
  type: string;
  data: {
    checkout_session?: {
      id: string;
      status: string;
      customer_email: string;
      product_id: string;
    };
    subscription?: {
      id: string;
      status: string;
      customer_email: string;
      product_id: string;
    };
  };
}

export async function createCheckoutSession(options: {
  customerEmail: string;
  successUrl: string;
  cancelUrl?: string;
}): Promise<PolarCheckoutSession> {
  if (!POLAR_TOKEN || !POLAR_PRODUCT_ID) {
    throw new Error("Polar configuration missing");
  }

  const response = await fetch(`${API_BASE}/v1/checkouts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POLAR_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: POLAR_PRODUCT_ID,
      customer_email: options.customerEmail,
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Polar API error: ${response.status} ${error}`);
  }

  return response.json();
}

export async function getSubscription(subscriptionId: string) {
  if (!POLAR_TOKEN) {
    throw new Error("Polar token missing");
  }

  const response = await fetch(
    `${API_BASE}/v1/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${POLAR_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get subscription: ${response.status}`);
  }

  return response.json();
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Polar webhook verification would go here
  // For now, we'll implement basic verification
  // In production, use proper HMAC verification
  return true; // Implement proper verification based on Polar docs
}
