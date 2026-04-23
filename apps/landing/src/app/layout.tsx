import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KDL Store — Sistema de Gestão para o Pequeno Comércio",
  description:
    "KDL Store é o sistema de gestão completo para pequenas lojas: controle de estoque, PDV, garantias digitais, clientes, fornecedores, financeiro e muito mais. Tudo em um só lugar.",
  keywords: "sistema de gestão, pequeno comércio, PDV, estoque, garantia digital, loja, ERP, micro saas",
  openGraph: {
    title: "KDL Store — Sistema de Gestão para o Pequeno Comércio",
    description: "Chega de papel e bagunça. Gerencie sua loja com profissionalismo.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
