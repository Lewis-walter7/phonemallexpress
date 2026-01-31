import WhatsAppButton from "@/components/common/WhatsAppButton";
import Chatbot from "@/components/common/Chatbot";
import "@/components/common/WhatsAppButton.css";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import CompareFloatingBar from "@/components/product/CompareFloatingBar";

import { Suspense } from "react";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <WhatsAppButton />
            <Chatbot />
            <CompareFloatingBar />
        </>
    );
}
