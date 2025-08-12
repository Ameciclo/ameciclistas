import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getBiblioteca, getEmprestimos, getSolicitacoes } from "~/api/firebaseConnection.server";
import type { Livro, Emprestimo } from "~/utils/types";

export async function bibliotecaLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const busca = url.searchParams.get("busca") || "";
  
  try {
    const bibliotecaData = await getBiblioteca();
    const emprestimosData = await getEmprestimos();
    const solicitacoesData = await getSolicitacoes();
    
    const biblioteca: Livro[] = bibliotecaData ? Object.keys(bibliotecaData).map(key => ({ id: key, ...bibliotecaData[key] })) : [];
    const emprestimos: Emprestimo[] = emprestimosData ? Object.keys(emprestimosData).map(key => ({ id: key, ...emprestimosData[key] })) : [];
    const solicitacoes = solicitacoesData ? Object.keys(solicitacoesData).map(key => ({ id: key, ...solicitacoesData[key] })) : [];
    
    const livrosFiltrados = biblioteca.filter((livro: any) =>
      (livro.title?.toLowerCase() || "").includes(busca.toLowerCase()) ||
      (livro.author?.toLowerCase() || "").includes(busca.toLowerCase())
    );

    // Mapear para estrutura esperada e criar exemplares baseados no register
    const livrosComDisponibilidade = livrosFiltrados.map(livro => {
      const emprestado = emprestimos.some((emp: any) => 
        emp.subcodigo === livro.register && emp.status === 'emprestado'
      );
      
      return {
        ...livro,
        titulo: livro.title,
        autor: livro.author,
        codigo: livro.register,
        ano: livro.year,
        tipo: livro.type,
        exemplares: [{
          subcodigo: livro.register,
          disponivel: !emprestado,
          consulta_local: false
        }]
      };
    });

    return json({ 
      livros: livrosComDisponibilidade, 
      emprestimos: emprestimos.filter((emp: any) => emp.status === 'emprestado'),
      solicitacoes: solicitacoes.filter((sol: any) => sol.status === 'pendente')
    });
  } catch (error) {
    console.error("Erro ao carregar dados da biblioteca do Firebase:", error);
    return json({ livros: [], emprestimos: [], solicitacoes: [] });
  }
}