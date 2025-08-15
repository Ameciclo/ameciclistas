import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getBiblioteca, getEmprestimos, getSolicitacoes, getUsersFirebase } from "~/api/firebaseConnection.server";
import type { Livro, Emprestimo } from "~/utils/types";

export async function bibliotecaLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const busca = url.searchParams.get("busca") || "";
  
  try {
    const bibliotecaData = await getBiblioteca();
    const emprestimosData = await getEmprestimos();
    const solicitacoesData = await getSolicitacoes();
    const usersData = await getUsersFirebase();
    
    const biblioteca: Livro[] = bibliotecaData ? Object.keys(bibliotecaData).map(key => ({ id: key, ...bibliotecaData[key] })) : [];
    const emprestimos: Emprestimo[] = emprestimosData ? Object.keys(emprestimosData).map(key => ({ id: key, ...emprestimosData[key] })) : [];
    const solicitacoes = solicitacoesData ? Object.keys(solicitacoesData).map(key => ({ id: key, ...solicitacoesData[key] })) : [];
    
    // Debug: verificar empréstimos carregados
    if (process.env.NODE_ENV === "development") {
      console.log(`Carregados ${emprestimos.length} empréstimos:`, 
        emprestimos.filter(emp => emp.status === 'emprestado')
      );
    }
    
    const livrosFiltrados = biblioteca.filter((livro: any) =>
      (livro.title?.toLowerCase() || "").includes(busca.toLowerCase()) ||
      (livro.author?.toLowerCase() || "").includes(busca.toLowerCase())
    );

    // Agrupar livros por título
    const livrosAgrupados: { [key: string]: any } = {};
    
    livrosFiltrados.forEach(livro => {
      const titulo = livro.title;
      
      if (!livrosAgrupados[titulo]) {
        livrosAgrupados[titulo] = {
          ...livro,
          titulo: livro.title,
          autor: livro.author,
          codigo: livro.register,
          ano: livro.year,
          tipo: livro.type,
          exemplares: []
        };
      }
      
      // Verificar se este exemplar está emprestado
      const emprestimosDoExemplar = emprestimos.filter((emp: any) => 
        emp.subcodigo === livro.register && emp.status === 'emprestado'
      );
      
      const emprestado = emprestimosDoExemplar.length > 0;
      
      // Debug: log para verificar empréstimos
      if (process.env.NODE_ENV === "development" && emprestimosDoExemplar.length > 0) {
        console.log(`Exemplar ${livro.register} está emprestado:`, emprestimosDoExemplar);
      }
      
      const isConsultaLocal = livro.register.endsWith('.1');
      
      livrosAgrupados[titulo].exemplares.push({
        subcodigo: livro.register,
        disponivel: !emprestado && !isConsultaLocal, // Disponível se não emprestado e não for .1
        consulta_local: isConsultaLocal,
        emprestado: emprestado
      });
    });
    
    const livrosComDisponibilidade = Object.values(livrosAgrupados);

    return json({ 
      livros: livrosComDisponibilidade, 
      emprestimos: emprestimos.filter((emp: any) => emp.status === 'emprestado'),
      solicitacoes: solicitacoes.filter((sol: any) => sol.status === 'pendente'),
      users: usersData || {}
    });
  } catch (error) {
    console.error("Erro ao carregar dados da biblioteca do Firebase:", error);
    return json({ livros: [], emprestimos: [], solicitacoes: [], users: {} });
  }
}