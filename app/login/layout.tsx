import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | StockFlow',
    description: 'Log in to your StockFlow account to manage your inventory and billing.',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
