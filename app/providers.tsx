"use client";

import { SessionProvider } from "next-auth/react";
import { PaymentModalProvider } from "@/components/patient/paymentmodal/paymentmodalcontext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PaymentModalProvider>
        {children}
      </PaymentModalProvider>
    </SessionProvider>
  );
}
