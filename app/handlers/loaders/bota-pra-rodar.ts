import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getBicicletas, getEmprestimosBicicletas, getSolicitacoesBicicletas, getUsersFirebase } from "~/api/firebaseConnection.server";
import type { Bicicleta, EmprestimoBicicleta } from "~/utils/types";

export async function botaPraRodarLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const busca = url.searchParams.get("busca") || "";
  
  try {
    const bicicletasData = await getBicicletas();
    const emprestimosData = await getEmprestimosBicicletas();
    const solicitacoesData = await getSolicitacoesBicicletas();
    const usersData = await getUsersFirebase();
    
    const bicicletas: Bicicleta[] = bicicletasData ? Object.keys(bicicletasData).map(key => ({ id: key, ...bicicletasData[key] })) : [];
    const emprestimos: EmprestimoBicicleta[] = emprestimosData ? Object.keys(emprestimosData).map(key => ({ id: key, ...emprestimosData[key] })) : [];
    const solicitacoes = solicitacoesData ? Object.keys(solicitacoesData).map(key => ({ id: key, ...solicitacoesData[key] })) : [];
    
    if (process.env.NODE_ENV === "development") {
      console.log(`Carregados ${emprestimos.length} empréstimos de bicicletas:`, 
        emprestimos.filter(emp => emp.status === 'emprestado')
      );
    }
    
    const bicicletasFiltradas = bicicletas.filter((bicicleta: any) =>
      (bicicleta.nome?.toLowerCase() || "").includes(busca.toLowerCase()) ||
      (bicicleta.codigo?.toLowerCase() || "").includes(busca.toLowerCase())
    );

    // Atualizar status de disponibilidade das bicicletas
    const bicicletasComDisponibilidade = bicicletasFiltradas.map(bicicleta => {
      const emprestimosAtivos = emprestimos.filter((emp: any) => 
        emp.codigo_bicicleta === bicicleta.codigo && emp.status === 'emprestado'
      );
      
      return {
        ...bicicleta,
        disponivel: emprestimosAtivos.length === 0,
        emprestada: emprestimosAtivos.length > 0
      };
    });

    return json({ 
      bicicletas: bicicletasComDisponibilidade, 
      emprestimos: emprestimos.filter((emp: any) => emp.status === 'emprestado'),
      solicitacoes: solicitacoes.filter((sol: any) => sol.status === 'pendente'),
      users: usersData || {}
    });
  } catch (error) {
    console.error("Erro ao carregar dados do Bota pra Rodar do Firebase:", error);
    return json({ bicicletas: [], emprestimos: [], solicitacoes: [], users: {} });
  }
}