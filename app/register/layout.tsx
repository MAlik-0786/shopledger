import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account | ShopLedger',
    description: 'Join ShopLedger to transform your retail business with smart inventory and quick billing.',
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
