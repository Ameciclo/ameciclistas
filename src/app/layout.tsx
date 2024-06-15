// src/app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="pt">
      <body>
        <header>
          <h1>Minha Aplicação</h1>
          <nav>
            {/* Adicione links de navegação aqui */}
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>© 2024 Minha Aplicação. Todos os direitos reservados.</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
