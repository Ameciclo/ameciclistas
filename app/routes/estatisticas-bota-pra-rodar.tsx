import { useState, useEffect } from "react";
import { useLoaderData, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getBicicletas, getEmprestimosBicicletas } from "~/api/firebaseConnection.server";
import type { Bicicleta, EmprestimoBicicleta } from "~/utils/types";
import { requireAuth } from "~/utils/authMiddleware";
import { UserCategory } from "~/utils/types";

const originalLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const bicicletasData = await getBicicletas();
    const emprestimosData = await getEmprestimosBicicletas();
    
    const bicicletas: Bicicleta[] = bicicletasData ? Object.keys(bicicletasData).map(key => ({ id: key, ...bicicletasData[key] })) : [];
    const emprestimos: EmprestimoBicicleta[] = emprestimosData ? Object.keys(emprestimosData).map(key => ({ id: key, ...emprestimosData[key] })) : [];
    
    return json({ bicicletas, emprestimos });
  } catch (error) {
    console.error("Erro ao carregar estatísticas do Bota pra Rodar:", error);
    return json({ bicicletas: [], emprestimos: [] });
  }
};

export const loader = requireAuth(UserCategory.ANY_USER)(originalLoader);

export default function EstatisticasBotaPraRodar() {
  const { bicicletas, emprestimos } = useLoaderData<typeof loader>();
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear().toString());

  // Estatísticas gerais
  const totalBicicletas = bicicletas.length;
  const bicicletasDisponiveis = bicicletas.filter(b => b.disponivel).length;
  const bicicletasEmprestadas = totalBicicletas - bicicletasDisponiveis;
  
  const emprestimosAtivos = emprestimos.filter(emp => emp.status === 'emprestado');
  const emprestimosFinalizados = emprestimos.filter(emp => emp.status === 'devolvido');
  const totalEmprestimos = emprestimos.length;

  // Filtrar empréstimos por período
  const emprestimosFiltrados = emprestimos.filter(emp => {
    const dataEmprestimo = new Date(emp.data_saida);
    const anoEmprestimo = dataEmprestimo.getFullYear().toString();
    const mesEmprestimo = (dataEmprestimo.getMonth() + 1).toString().padStart(2, '0');
    
    if (filtroAno && anoEmprestimo !== filtroAno) return false;
    if (filtroMes && mesEmprestimo !== filtroMes) return false;
    
    return true;
  });



  // Empréstimos por mês
  const emprestimosPorMes = emprestimosFiltrados.reduce((acc: any, emp) => {
    const data = new Date(emp.data_saida);
    const mesAno = `${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
    acc[mesAno] = (acc[mesAno] || 0) + 1;
    return acc;
  }, {});

  // Obter anos únicos para o filtro
  const anosUnicos = [...new Set(emprestimos.map(emp => new Date(emp.data_saida).getFullYear().toString()))].sort();

  const meses = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link to="/bota-pra-rodar" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 mb-6">📊 Estatísticas - Bota pra Rodar</h1>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <select
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos os anos</option>
              {anosUnicos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos os meses</option>
              {meses.map(mes => (
                <option key={mes.value} value={mes.value}>{mes.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Bicicletas</h3>
          <p className="text-3xl font-bold text-teal-600">{totalBicicletas}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Disponíveis</h3>
          <p className="text-3xl font-bold text-green-600">{bicicletasDisponiveis}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Emprestadas</h3>
          <p className="text-3xl font-bold text-orange-600">{bicicletasEmprestadas}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Empréstimos</h3>
          <p className="text-3xl font-bold text-blue-600">{emprestimosFiltrados.length}</p>
        </div>
      </div>

      {/* Estatísticas de Uso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pessoas Beneficiadas</h3>
          <p className="text-3xl font-bold text-purple-600">{[...new Set(emprestimos.map(emp => emp.usuario_id))].length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tempo Médio</h3>
          <p className="text-lg text-gray-600">(em horas)</p>
          <p className="text-3xl font-bold text-indigo-600">{emprestimosFinalizados.length > 0 ? Math.round(emprestimosFinalizados.reduce((acc, emp) => {
            const inicio = new Date(emp.data_saida);
            const fim = new Date(emp.data_devolucao);
            return acc + (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
          }, 0) / emprestimosFinalizados.length) : 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tempo Mínimo</h3>
          <p className="text-lg text-gray-600">(em horas)</p>
          <p className="text-3xl font-bold text-green-600">{emprestimosFinalizados.length > 0 ? Math.min(...emprestimosFinalizados.map(emp => {
            const inicio = new Date(emp.data_saida);
            const fim = new Date(emp.data_devolucao);
            return Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60));
          })) : 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tempo Máximo</h3>
          <p className="text-lg text-gray-600">(em horas)</p>
          <p className="text-3xl font-bold text-red-600">{emprestimosFinalizados.length > 0 ? Math.max(...emprestimosFinalizados.map(emp => {
            const inicio = new Date(emp.data_saida);
            const fim = new Date(emp.data_devolucao);
            return Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60));
          })) : 0}</p>
        </div>
      </div>

      {/* Bicicletas Mais Populares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Bicicleta Mais Querida</h3>
          {(() => {
            const contadorEmprestimos = emprestimos.reduce((acc, emp) => {
              acc[emp.codigo_bicicleta] = (acc[emp.codigo_bicicleta] || 0) + 1;
              return acc;
            }, {});
            const maisEmprestada = Object.entries(contadorEmprestimos).sort(([,a], [,b]) => b - a)[0];
            const bicicleta = maisEmprestada ? bicicletas.find(b => b.codigo === maisEmprestada[0]) : null;
            return bicicleta ? (
              <div>
                <p className="text-lg font-semibold text-teal-600">{bicicleta.nome}</p>
                <p className="text-gray-600">Código: {bicicleta.codigo}</p>
                <p className="text-gray-600">{maisEmprestada[1]} empréstimos</p>
              </div>
            ) : <p className="text-gray-500">Nenhum dado disponível</p>;
          })()}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mais Tempo Emprestada</h3>
          {(() => {
            const temposPorBicicleta = emprestimosFinalizados.reduce((acc, emp) => {
              const inicio = new Date(emp.data_saida);
              const fim = new Date(emp.data_devolucao);
              const horas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
              acc[emp.codigo_bicicleta] = (acc[emp.codigo_bicicleta] || 0) + horas;
              return acc;
            }, {});
            const maisTempoEmprestada = Object.entries(temposPorBicicleta).sort(([,a], [,b]) => b - a)[0];
            const bicicleta = maisTempoEmprestada ? bicicletas.find(b => b.codigo === maisTempoEmprestada[0]) : null;
            return bicicleta ? (
              <div>
                <p className="text-lg font-semibold text-purple-600">{bicicleta.nome}</p>
                <p className="text-gray-600">Código: {bicicleta.codigo}</p>
                <p className="text-gray-600">{Math.round(maisTempoEmprestada[1])} horas totais</p>
              </div>
            ) : <p className="text-gray-500">Nenhum dado disponível</p>;
          })()}
        </div>
      </div>

      {/* Empréstimos por Mês */}
      {Object.keys(emprestimosPorMes).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Estatísticas Mensais de Empréstimo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(emprestimosPorMes)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([mesAno, quantidade]) => (
                <div key={mesAno} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{mesAno}</h4>
                  <p className="text-2xl font-bold text-teal-600">{quantidade}</p>
                  <p className="text-sm text-gray-600">empréstimos</p>
                </div>
              ))}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <Link 
          to="/bota-pra-rodar" 
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar para Bota pra Rodar
        </Link>
      </div>
    </div>
  );
}