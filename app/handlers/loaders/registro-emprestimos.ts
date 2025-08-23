import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getItensInventario, getEmprestimosInventario, getSolicitacoesInventario, getUsersFirebase } from "~/api/firebaseConnection.server";
import type { ItemInventario, EmprestimoInventario } from "~/utils/types";

export async function registroEmprestimosLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const busca = url.searchParams.get("busca") || "";
  
  try {
    const itensData = await getItensInventario();
    const emprestimosData = await getEmprestimosInventario();
    const solicitacoesData = await getSolicitacoesInventario();
    const usersData = await getUsersFirebase();
    
    const itens: ItemInventario[] = itensData ? Object.keys(itensData).map(key => ({ id: key, ...itensData[key] })) : [];
    const emprestimos: EmprestimoInventario[] = emprestimosData ? Object.keys(emprestimosData).map(key => ({ id: key, ...emprestimosData[key] })) : [];
    const solicitacoes = solicitacoesData ? Object.keys(solicitacoesData).map(key => ({ id: key, ...solicitacoesData[key] })) : [];
    
    if (process.env.NODE_ENV === "development") {
      console.log(`Carregados ${emprestimos.length} empréstimos de inventário:`, 
        emprestimos.filter(emp => emp.status === 'emprestado')
      );
    }
    
    const itensFiltrados = itens.filter((item: any) =>
      (item.nome?.toLowerCase() || "").includes(busca.toLowerCase()) ||
      (item.codigo?.toLowerCase() || "").includes(busca.toLowerCase()) ||
      (item.categoria?.toLowerCase() || "").includes(busca.toLowerCase())
    );

    // Atualizar status de disponibilidade dos itens
    const itensComDisponibilidade = itensFiltrados.map(item => {
      const emprestimosAtivos = emprestimos.filter((emp: any) => 
        emp.codigo_item === item.codigo && emp.status === 'emprestado'
      );
      
      return {
        ...item,
        disponivel: emprestimosAtivos.length === 0,
        emprestado: emprestimosAtivos.length > 0
      };
    });

    return json({ 
      itens: itensComDisponibilidade, 
      emprestimos: emprestimos.filter((emp: any) => emp.status === 'emprestado'),
      solicitacoes: solicitacoes.filter((sol: any) => sol.status === 'pendente'),
      users: usersData || {}
    });
  } catch (error) {
    console.error("Erro ao carregar dados do inventário do Firebase:", error);
    return json({ itens: [], emprestimos: [], solicitacoes: [], users: {} });
  }
}