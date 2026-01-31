"use client";

import React from 'react';
import { ThemeProvider } from "./ThemeProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="data-theme"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <CartProvider>
                <WishlistProvider>
                    <CompareProvider>
                        {children}
                        <Toaster position="bottom-right" />
                    </CompareProvider>
                </WishlistProvider>
            </CartProvider>
        </ThemeProvider>
    );
}
