import Link from 'next/link';
import { ReactNode } from 'react';

type LegalShellProps = {
  title: string;
  eyebrow?: string;
  description: string;
  children: ReactNode;
};

export const legalLinks = [
  { href: '/', label: 'Overview' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-condition', label: 'Terms of Service' },
  { href: '/data-deletion', label: 'Data Deletion' },
];

export function LegalShell({
  title,
  eyebrow = 'WiseSocial by WiseAdmit',
  description,
  children,
}: LegalShellProps) {
  return (
    <main className="min-h-dvh bg-[#f7f8fb] text-[#111827]">
      <header className="border-b border-[#d9dee8] bg-white">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-[18px] px-[20px] py-[24px] md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-[22px] font-[700] text-[#0f172a]">
            WiseSocial
          </Link>
          <nav className="flex flex-wrap gap-[10px] text-[14px] font-[600] text-[#475569]">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[6px] px-[10px] py-[8px] hover:bg-[#eef2f7] hover:text-[#0f172a]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="rounded-[6px] bg-[#0f172a] px-[12px] py-[8px] text-white hover:bg-[#253047]"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <section className="border-b border-[#d9dee8] bg-white">
        <div className="mx-auto w-full max-w-[1120px] px-[20px] py-[54px]">
          <div className="text-[13px] font-[700] uppercase text-[#2563eb]">
            {eyebrow}
          </div>
          <h1 className="mt-[12px] max-w-[760px] text-[40px] font-[700] leading-[1.12] text-[#0f172a] md:text-[54px]">
            {title}
          </h1>
          <p className="mt-[18px] max-w-[760px] text-[17px] leading-[1.7] text-[#475569]">
            {description}
          </p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[1120px] px-[20px] py-[42px]">
        {children}
      </section>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-[34px] max-w-[850px]">
      <h2 className="text-[24px] font-[700] text-[#0f172a]">{title}</h2>
      <div className="mt-[12px] space-y-[12px] text-[15px] leading-[1.75] text-[#334155]">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-[10px]">
      {items.map((item) => (
        <li key={item} className="pl-[18px] [text-indent:-18px]">
          <span className="font-[700] text-[#0f172a]">-</span> {item}
        </li>
      ))}
    </ul>
  );
}
