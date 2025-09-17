import { useLoaderData, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "~/api/firebaseAdmin.server.js";
import { requireAuth } from "~/utils/authMiddleware";
import { UserCategory } from "~/utils/types";

// Funções para buscar dados do Firebase
async function buscarBibliotecaFirebase(): Promise<any[]> {
  try {
    const ref = db.ref("library");
    const snapshot = await ref.once("value");
    const data = snapshot.val();

    if (!data) return [];

    return Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));
  } catch (error) {
    console.error("Erro ao buscar biblioteca:", error);
    return [];
  }
}

async function buscarTodosEmprestimosFirebase(): Promise<any[]> {
  try {
    const ref = db.ref("loan_record");
    const snapshot = await ref.once("value");
    const data = snapshot.val();

    if (!data) return [];

    return Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error);
    return [];
  }
}

const originalLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const emprestimos = await buscarTodosEmprestimosFirebase();
    const biblioteca = await buscarBibliotecaFirebase();

    const estatisticas = {
      total_emprestimos: emprestimos.length,
      titulos_diferentes: new Set(
        emprestimos.map(
          (emp: any) => emp.subcodigo?.split(".")[0] || emp.codigo
        )
      ).size,
      devolvidos: emprestimos.filter((emp: any) => emp.status === "devolvido")
        .length,
      a_receber: emprestimos.filter((emp: any) => emp.status === "emprestado")
        .length,
      pessoas_beneficiadas: new Set(
        emprestimos.map((emp: any) => emp.usuario_id)
      ).size,
      tempo_medio: getTempoMedio(emprestimos),
      tempo_minimo: getTempoMinimo(emprestimos),
      tempo_maximo: getTempoMaximo(emprestimos),
      livro_mais_querido: getLivroMaisQuerido(emprestimos, biblioteca),
      longo_pra_ler: getLongoPraLer(emprestimos, biblioteca),
      livros_mais_emprestados: getLivrosMaisEmprestados(
        emprestimos,
        biblioteca
      ),
      emprestimos_por_mes: getEmprestimosPorMes(emprestimos),
    };

    return json({ estatisticas });
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
    // Fallback para dados locais em caso de erro
    const emprestimos = [];
    const biblioteca = [];

    const estatisticas = {
      total_emprestimos: 0,
      titulos_diferentes: 0,
      devolvidos: 0,
      a_receber: 0,
      pessoas_beneficiadas: 0,
      tempo_medio: 0,
      tempo_minimo: 0,
      tempo_maximo: 0,
      livro_mais_querido: null,
      longo_pra_ler: null,
      livros_mais_emprestados: [],
      emprestimos_por_mes: [],
    };

    return json({ estatisticas });
  }
};

export const loader = requireAuth(UserCategory.ANY_USER)(originalLoader);

function getLivrosMaisEmprestados(emprestimos: any[], biblioteca: any[]) {
  const contagem: { [key: string]: { count: number; titulo: string } } = {};

  emprestimos.forEach((emp: any) => {
    const codigo = emp.subcodigo;
    const livro = biblioteca.find(
      (l: any) => l.register === codigo || l.id === codigo
    );

    const titulo = livro?.title || emp.titulo || "Título não encontrado";

    // Agrupar por título, não por código individual
    if (!contagem[titulo]) {
      contagem[titulo] = { count: 0, titulo };
    }
    contagem[titulo].count++;
  });

  return Object.entries(contagem)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([titulo, data]) => ({ codigo: titulo, ...data }));
}

function getEmprestimosPorMes(emprestimos: any[]) {
  const meses: { [key: string]: number } = {};

  emprestimos.forEach((emp: any) => {
    if (emp.data_saida) {
      const mes = emp.data_saida.substring(0, 7); // YYYY-MM
      meses[mes] = (meses[mes] || 0) + 1;
    }
  });

  return Object.entries(meses)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, count]) => ({ mes, count }));
}

function getTempoMedio(emprestimos: any[]) {
  const tempos = emprestimos
    .filter((emp: any) => emp.tempo_emprestimo > 0)
    .map((emp: any) => emp.tempo_emprestimo);

  if (tempos.length === 0) return 0;
  return Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
}

function getTempoMinimo(emprestimos: any[]) {
  const tempos = emprestimos
    .filter((emp: any) => emp.tempo_emprestimo > 0)
    .map((emp: any) => emp.tempo_emprestimo);

  return tempos.length > 0 ? Math.min(...tempos) : 0;
}

function getTempoMaximo(emprestimos: any[]) {
  const tempos = emprestimos
    .filter((emp: any) => emp.tempo_emprestimo > 0)
    .map((emp: any) => emp.tempo_emprestimo);

  return tempos.length > 0 ? Math.max(...tempos) : 0;
}

function getLivroMaisQuerido(emprestimos: any[], biblioteca: any[]) {
  const contagem = getLivrosMaisEmprestados(emprestimos, biblioteca);
  return contagem.length > 0 ? contagem[0] : null;
}

function getLongoPraLer(emprestimos: any[], biblioteca: any[]) {
  const emprestimo = emprestimos
    .filter((emp: any) => emp.tempo_emprestimo > 0)
    .sort((a, b) => b.tempo_emprestimo - a.tempo_emprestimo)[0];

  if (!emprestimo) return null;

  const codigo = emprestimo.subcodigo;
  const livro = biblioteca.find(
    (l: any) => l.register === codigo || l.id === codigo
  );

  return {
    codigo,
    titulo: livro?.title || emprestimo.titulo,
    tempo: emprestimo.tempo_emprestimo,
  };
}

export default function BibliotecaEstatisticas() {
  const { estatisticas } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link to="/biblioteca" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 mb-6">
        Estatísticas da Biblioteca
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Total de Empréstimos
          </h3>
          <p className="text-3xl font-bold text-teal-600">
            {estatisticas.total_emprestimos}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Títulos Diferentes
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {estatisticas.titulos_diferentes}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Devolvidos</h3>
          <p className="text-3xl font-bold text-green-600">
            {estatisticas.devolvidos}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">À Receber</h3>
          <p className="text-3xl font-bold text-orange-600">
            {estatisticas.a_receber}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Pessoas Beneficiadas
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {estatisticas.pessoas_beneficiadas}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Tempo Médio</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {estatisticas.tempo_medio} dias
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Tempo Mínimo</h3>
          <p className="text-3xl font-bold text-cyan-600">
            {estatisticas.tempo_minimo} dias
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Tempo Máximo</h3>
          <p className="text-3xl font-bold text-red-600">
            {estatisticas.tempo_maximo} dias
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Livro Mais Querido</h2>
          {estatisticas.livro_mais_querido ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                {estatisticas.livro_mais_querido.titulo}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {estatisticas.livro_mais_querido.count} empréstimos
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum dado disponível</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Longo pra Ler</h2>
          {estatisticas.longo_pra_ler ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                {estatisticas.longo_pra_ler.titulo}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {estatisticas.longo_pra_ler.tempo} dias
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Livros Mais Emprestados</h2>
          <div className="space-y-3">
            {estatisticas.livros_mais_emprestados.map(
              (item: any, index: number) => (
                <div
                  key={item.codigo}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">
                      #{index + 1}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{item.titulo}</p>
                  </div>
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {item.count} empréstimos
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Empréstimos por Mês</h2>
          <div className="space-y-2">
            {estatisticas.emprestimos_por_mes.slice(-12).map((item: any) => (
              <div
                key={item.mes}
                className="flex justify-between items-center p-2 border-b"
              >
                <span className="text-gray-700">{item.mes}</span>
                <div className="flex items-center">
                  <div
                    className="bg-teal-200 h-4 rounded mr-2"
                    style={{
                      width: `${
                        (item.count /
                          Math.max(
                            ...estatisticas.emprestimos_por_mes.map(
                              (i: any) => i.count
                            )
                          )) *
                        100
                      }px`,
                    }}
                  ></div>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/biblioteca"
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar ao Acervo
        </Link>
      </div>
    </div>
  );
}
