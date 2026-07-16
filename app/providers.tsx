"use client";

import { SessionProvider } from "next-auth/react";

// next-auth/react's useSession()/signIn()/signOut() hooks only work inside
// a <SessionProvider>. This has to be a separate client component because
// app/layout.tsx is a server component by default, and providers that use
// React context must run on the client.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}