import { KHALTI_SECRET_KEY, KHALTI_BASE_URL, CLIENT_URL } from "../config";
import { HttpError } from "../errors/http-error";

interface InitiateParams {
    amountInRupees: number;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}

interface InitiateResult {
    pidx: string;
    paymentUrl: string;
}

// SECURITY / TRANSACTION FEATURE: Khalti ePayment (real trusted third-party
// gateway). Step 1 — ask Khalti to open a payment session for this order.
// Khalti expects the amount in paisa (smallest unit), so rupees * 100.
export const initiateKhaltiPayment = async (params: InitiateParams): Promise<InitiateResult> => {
    if (!KHALTI_SECRET_KEY) {
        throw new HttpError(500, "Payment gateway is not configured (missing KHALTI_SECRET_KEY).");
    }

    const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
        method: "POST",
        headers: {
            Authorization: `key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            return_url: `${CLIENT_URL}/payment/callback`,
            website_url: CLIENT_URL,
            amount: Math.round(params.amountInRupees * 100),
            purchase_order_id: params.orderId,
            purchase_order_name: `DishDash Order ${params.orderId}`,
            customer_info: {
                name: params.customerName,
                email: params.customerEmail,
                phone: params.customerPhone,
            },
        }),
    });

    const data: any = await response.json();

    if (!response.ok || !data.pidx || !data.payment_url) {
        throw new HttpError(502, data?.detail || "Failed to initiate payment with Khalti.");
    }

    return { pidx: data.pidx, paymentUrl: data.payment_url };
};

export type KhaltiLookupStatus = "Completed" | "Pending" | "Expired" | "User canceled" | "Refunded" | "Partially Refunded";

interface LookupResult {
    status: KhaltiLookupStatus;
    totalAmount: number;
    transactionId: string | null;
}

// SECURITY FEATURE: this is the critical trust boundary. NEVER trust a
// client-reported "payment successful" claim (e.g. a query param on the
// return_url redirect, which a user could manually forge by visiting that
// URL with fake parameters). The only source of truth for whether money
// actually moved is this server-to-server lookup call, authenticated with
// our own secret key, directly against Khalti's API.
export const lookupKhaltiPayment = async (pidx: string): Promise<LookupResult> => {
    if (!KHALTI_SECRET_KEY) {
        throw new HttpError(500, "Payment gateway is not configured (missing KHALTI_SECRET_KEY).");
    }

    const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
        method: "POST",
        headers: {
            Authorization: `key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
    });

    const data: any = await response.json();

    if (!response.ok || !data.status) {
        throw new HttpError(502, data?.detail || "Failed to verify payment status with Khalti.");
    }

    return {
        status: data.status,
        totalAmount: data.total_amount,
        transactionId: data.transaction_id || null,
    };
};