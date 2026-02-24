import { Outfit, Geist_Mono } from 'next/font/google';

export const outfit = Outfit({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-outfit',
    preload: true,
});

export const geistMono = Geist_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-geist-mono',
    preload: true,
});
