"use client";

import type { Transaction } from '@/types';
import { TrendingUp, TrendingDown, CreditCard, XCircle, Undo2, BadgeDollarSign } from 'lucide-react';
import { FormattedDate } from './FormattedDate';

interface TransactionCardProps {
    transaction: Transaction;
    currencySymbol: string;
}

const transactionTypes = {
    top_up: { icon: CreditCard, color: 'text-green-500', label: 'Wallet Top-Up' },
    booking_fee: { icon: BadgeDollarSign, color: 'text-red-500', label: 'Platform Fee' },
    cancellation_fee_debit: { icon: XCircle, color: 'text-red-500', label: 'Cancellation Fee' },
    cancellation_fee_credit: { icon: TrendingUp, color: 'text-green-500', label: 'Cancellation Credit' },
    refund: { icon: Undo2, color: 'text-blue-500', label: 'Refund' },
};

export function TransactionCard({ transaction, currencySymbol }: TransactionCardProps) {
    const typeInfo = transactionTypes[transaction.type] || { icon: TrendingDown, color: 'text-gray-500', label: 'Transaction' };
    const isCredit = transaction.amount > 0 || transaction.type === 'cancellation_fee_credit' || transaction.type === 'top_up';

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full bg-muted ${typeInfo.color}`}>
                    <typeInfo.icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold">{typeInfo.label}</p>
                    <p className="text-sm text-muted-foreground"><FormattedDate date={transaction.createdAt} /></p>
                </div>
            </div>
            <p className={`font-bold text-lg ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                {isCredit ? '+' : ''}{currencySymbol}{Math.abs(transaction.amount).toFixed(2)}
            </p>
        </div>
    );
}