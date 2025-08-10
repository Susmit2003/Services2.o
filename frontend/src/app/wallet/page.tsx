"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Wallet, PlusCircle, ReceiptText, Loader2 } from 'lucide-react';
import { currencySymbols } from '@/lib/constants';
import { TransactionCard } from '@/components/custom/transaction-card';
import { TopUpDialog } from '@/components/custom/top-up-dialog';
import type { Transaction } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getWalletTransactions } from '@/lib/actions/transaction.actions';
import { Skeleton } from '@/components/ui/skeleton';
import Script from 'next/script'; // Import the Next.js Script component

export default function WalletPage() {
    const { currentUser, isLoading: isAuthLoading, refetchUser } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isTxLoading, setIsTxLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (currentUser) {
            setIsTxLoading(true);
            try {
                const transactionsData = await getWalletTransactions();
                setTransactions(transactionsData);
            } catch (error) {
                console.error("Failed to fetch wallet transactions", error);
            } finally {
                setIsTxLoading(false);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTopUpSuccess = () => {
        refetchUser();
        fetchData();
    };

    if (isAuthLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-12 w-1/2" />
                <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <div>Please log in to view your wallet.</div>;
    }

    const currencySymbol = currencySymbols[currentUser.currency] || '₹';

    return (
        <>
            {/* --- THIS IS THE FIX --- */}
            {/* This script will be loaded before the page becomes interactive, */}
            {/* ensuring the 'Razorpay' object is available when the button is clicked. */}
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <div className="space-y-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold">My Wallet</h1>
                    <p className="text-muted-foreground">View your balance, add funds, and track your history.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-6 w-6" /> Current Balance</CardTitle></CardHeader>
                        <CardContent><p className="text-4xl font-bold">{currencySymbol}{currentUser.walletBalance.toFixed(2)}</p></CardContent>
                    </Card>
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle className="h-6 w-6" /> Add Funds</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Top up your wallet for platform fees.</p></CardContent>
                        <CardFooter><TopUpDialog user={currentUser} onSuccess={handleTopUpSuccess} /></CardFooter>
                    </Card>
                </div>

                <Card className="shadow-lg">
                    <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-6 w-6" /> Transaction History</CardTitle></CardHeader>
                    <CardContent>
                        {isTxLoading ? (
                            <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
                        ) : transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.map((tx) => (
                                    <TransactionCard key={tx.id} transaction={tx} currencySymbol={currencySymbol} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground"><p>You have no transactions yet.</p></div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}