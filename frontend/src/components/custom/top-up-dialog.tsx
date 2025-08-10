
// "use client";

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogClose,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';
// import { createRazorpayOrder } from '@/lib/actions/razorpay.actions';
// import { Loader2, Wallet, PlusCircle } from 'lucide-react';
// import { currencySymbols } from '@/lib/constants';

// declare global {
//     interface Window {
//         Razorpay: any;
//     }
// }

// interface TopUpDialogProps {
//     onSuccess: () => void;
//     currency: string;
// }

// export function TopUpDialog({ onSuccess, currency }: TopUpDialogProps) {
//     const [amount, setAmount] = useState('100');
//     const [isLoading, setIsLoading] = useState(false);
//     const { toast } = useToast();
//     const [isOpen, setIsOpen] = useState(false);
//     const currencySymbol = currencySymbols[currency] || '$';

//     const handleTopUp = async () => {
//         setIsLoading(true);
//         const numericAmount = parseFloat(amount);
//         if (isNaN(numericAmount) || numericAmount < 10 || numericAmount > 1000) {
//             toast({
//                 title: "Invalid Amount",
//                 description: "Please enter an amount between 10 and 1000.",
//                 variant: "destructive"
//             });
//             setIsLoading(false);
//             return;
//         }
        
//         try {
//             const response = await createRazorpayOrder(numericAmount);
//             if (response.error || !response.order || !response.key) {
//                 throw new Error(response.error || "Failed to create payment order.");
//             }

//             const options = {
//                 key: response.key,
//                 amount: response.order.amount,
//                 currency: response.order.currency,
//                 name: "HandyConnect Wallet",
//                 description: `Top-up of ${response.displayAmount}`,
//                 order_id: response.order.id,
//                 handler: function (res: any) {
//                     toast({
//                         title: "Payment Successful!",
//                         description: "Your wallet balance will be updated shortly. Payment ID: " + res.razorpay_payment_id,
//                     });
//                     setIsOpen(false);
//                     onSuccess();
//                 },
//                 prefill: {
//                     name: response.user.name,
//                     contact: response.user.contact
//                 },
//                 notes: {
//                     address: "HandyConnect Platform"
//                 },
//                 theme: {
//                     color: "#64B5F6"
//                 }
//             };
            
//             const rzp = new window.Razorpay(options);
//             rzp.on('payment.failed', function (res: any){
//                 toast({
//                     title: "Payment Failed",
//                     description: res.error.description,
//                     variant: "destructive"
//                 });
//             });
//             rzp.open();

//         } catch (error) {
//             toast({
//                 title: "Error",
//                 description: (error as Error).message,
//                 variant: "destructive"
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <Dialog open={isOpen} onOpenChange={setIsOpen}>
//             <DialogTrigger asChild>
//                 <Button>
//                     <PlusCircle className="mr-2 h-4 w-4" /> Top Up Wallet (via Razorpay)
//                 </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[425px]">
//                 <DialogHeader>
//                     <DialogTitle className="font-headline text-2xl flex items-center gap-2">
//                          <Wallet className="h-6 w-6 text-primary" /> Add Funds to Wallet
//                     </DialogTitle>
//                     <DialogDescription>
//                         Top up your wallet to pay for platform fees. Min 10, max 1000.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <div className="py-4 space-y-2">
//                     <Label htmlFor="amount" className="text-base">
//                         Amount to Add ({currency})
//                     </Label>
//                     <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">{currencySymbol}</span>
//                         <Input
//                             id="amount"
//                             type="number"
//                             value={amount}
//                             onChange={(e) => setAmount(e.target.value)}
//                             placeholder="100"
//                             className="h-12 text-lg pl-8"
//                             min="10"
//                             max="1000"
//                         />
//                     </div>
//                 </div>
//                 <DialogFooter>
//                     <DialogClose asChild>
//                         <Button type="button" variant="outline">Cancel</Button>
//                     </DialogClose>
//                     <Button type="button" onClick={handleTopUp} disabled={isLoading || !amount || parseFloat(amount) <= 0}>
//                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
//                         {isLoading ? "Processing..." : `Proceed to Pay ${currencySymbol}${amount}`}
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder, verifyTopUpPayment } from '@/lib/actions/razorpay.actions';
import type { UserProfile } from '@/types';

declare const Razorpay: any;

interface TopUpDialogProps {
    user: UserProfile;
    onSuccess: () => void;
}

export function TopUpDialog({ user, onSuccess }: TopUpDialogProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handlePayment = async () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 1) {
            toast({ title: "Please enter an amount greater than 1.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const order = await createRazorpayOrder(numericAmount);
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "HandyConnect Wallet Top-Up",
                order_id: order.id,
                handler: async (response: any) => {
                    const verificationResult = await verifyTopUpPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    toast({ title: "Payment Successful!", description: `Your wallet has been topped up.` });
                    onSuccess(); // This will refetch the balance and transactions
                    setIsOpen(false); // Close the dialog
                },
                prefill: { name: user.name, email: user.email, contact: user.mobile },
                theme: { color: "#3399cc" }
            };
            const rzp = new Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast({ title: "Failed to create order", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Funds</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Top Up Your Wallet</DialogTitle>
                    <DialogDescription>Enter the amount you want to add.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="amount">Amount (INR)</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 500" />
                </div>
                <DialogFooter>
                    <Button onClick={handlePayment} disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Processing...' : 'Proceed to Pay'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}