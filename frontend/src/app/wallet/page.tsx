import { getUserProfile } from '@/lib/actions/user.actions';
import { getWalletTransactions } from '@/lib/actions/transaction.actions';
import { WalletClient } from '@/components/custom/wallet-client'; // We will create this next
import { redirect } from 'next/navigation';

// This is now a Server Component. It runs on the server before the page loads.
export default async function WalletPage() {
    try {
        // 1. Fetch both the user profile and transactions directly on the server.
        // This happens before the page is sent to the browser, eliminating any race condition.
        const [user, transactions] = await Promise.all([
            getUserProfile(),
            getWalletTransactions()
        ]);

        // 2. If successful, pass the data to a client component for display.
        return <WalletClient user={user} initialTransactions={transactions} />;

    } catch (error) {
        // If getUserProfile fails, it means the user is not authenticated.
        // This is a secure way to protect the page.
        console.error("Authentication failed on wallet page, redirecting to login.");
        redirect('/login');
    }
}