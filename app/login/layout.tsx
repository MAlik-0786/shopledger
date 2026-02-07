import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | ShopLedger',
    description: 'Log in to your ShopLedger account to manage your inventory and billing.',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
