"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Wallet, PlusCircle, ReceiptText } from 'lucide-react';
import { currencySymbols } from '@/lib/constants';
import { TransactionCard } from '@/components/custom/transaction-card';
import { TopUpDialog } from '@/components/custom/top-up-dialog';
import type { Transaction, UserProfile } from '@/types';
import { useAuth } from '@/context/auth-context';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

interface WalletClientProps {
    user: UserProfile;
    initialTransactions: Transaction[];
}

export function WalletClient({ user, initialTransactions }: WalletClientProps) {
    const router = useRouter();
    // We still use the auth context to update the global state (e.g., header balance)
    const { refetchUser } = useAuth();
    
    // The component receives its initial state from the server component's props.
    const [transactions, setTransactions] = useState(initialTransactions);

    const handleTopUpSuccess = () => {
        // After a successful top-up, we refetch the user's global state
        // and tell Next.js to refresh the server component to get the new transaction list.
        refetchUser();
        router.refresh(); 
    };

    const currencySymbol = currencySymbols[user.currency] || '₹';

    return (
        <>
            <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="space-y-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold">My Wallet</h1>
                    <p className="text-muted-foreground">View your balance, add funds, and track your history.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-6 w-6" /> Current Balance</CardTitle></CardHeader>
                        <CardContent><p className="text-4xl font-bold">{currencySymbol}{user.walletBalance.toFixed(2)}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle className="h-6 w-6" /> Add Funds</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Top up your wallet for fees.</p></CardContent>
                        <CardFooter><TopUpDialog user={user} onSuccess={handleTopUpSuccess} /></CardFooter>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-6 w-6" /> Transaction History</CardTitle></CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.map((tx) => (<TransactionCard key={tx.id} transaction={tx} currencySymbol={currencySymbol} />))}
                            </div>
                        ) : (
                            <div className="text-center py-8"><p>You have no transactions yet.</p></div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}