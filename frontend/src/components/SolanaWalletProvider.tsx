"use client";

import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";

import {
    WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";

import {
    PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import {
    clusterApiUrl,
} from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

const wallets = [
    new PhantomWalletAdapter(),
];

export default function SolanaWalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const network = "devnet";

    const endpoint = clusterApiUrl(network);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

