// routes/solicitar-pagamento.tsx
// Group external libraries
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate, Form } from "@remix-run/react";

// Group internal components
import DropdownSelect from "~/components/FormsComponents/DropdownSelect";
import TextInput from "~/components/FormsComponents/TextInput";
import AutoCompleteInput from "~/components/FormsComponents/AutoCompleteInput";
import CurrencyInput from "~/components/FormsComponents/CurrencyInput";

// Group utilities and types
import { Supplier, UserCategory, UserData } from "../utils/types";
import { Project } from "~/utils/types";

import Unauthorized from "~/hooks/Unauthorized";
import { useAuthorization } from "~/hooks/useAuthorization";
import {
  getTelegramGeneralDataInfo,
  getTelegramUserInfo,
} from "~/api/telegramWebAppConection";

import { loader } from "~/loaders/solicitar-pagamento-loader";
import { action } from "~/loaders/solicitar-pagamento-action";

export { loader, action };

const pageAuthorization = UserCategory.PROJECT_COORDINATORS;

export default function SolicitarPagamento() {
  const { projects, suppliers } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const isAuthorized = useAuthorization(pageAuthorization);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<string | null>(
    null
  );
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("0");
  const [supplier, setSupplier] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [telegramData, setTelegramData] = useState([]);

  useEffect(() => {
    setUserData(() => getTelegramUserInfo());
    setTelegramData(() => getTelegramGeneralDataInfo());
  }, []);

  // Filtra o fornecedor selecionado, se necessário
  const selectedSupplier = suppliers.find((s: Supplier) => s.id === supplier);

  // Prepara os dados do projeto e fornecedor como JSON
  const selectedProjectStringfied = selectedProject
    ? JSON.stringify(selectedProject)
    : "";
  const selectedSuppierStringfied = selectedSupplier
    ? JSON.stringify(selectedSupplier)
    : "";
  const userDataStringfied = userData ? JSON.stringify(userData) : "";

  if (false) {
    return (
      <Unauthorized
        pageName="Solicitar Pagamento"
        requiredPermission="AMECICLISTAS"
      />
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedProject) {
      alert("Por favor, selecione um projeto.");
      e.preventDefault();
      return;
    }

    if (!selectedBudgetItem) {
      alert("Por favor, selecione uma rubrica.");
      e.preventDefault();
      return;
    }

    if (!supplier) {
      alert("Por favor, selecione um fornecedor.");
      e.preventDefault();
      return;
    }

    if (!description.trim()) {
      alert("Por favor, insira uma descrição.");
      e.preventDefault();
      return;
    }

    if (!value || parseFloat(value) <= 0) {
      alert("Por favor, insira um valor válido.");
      e.preventDefault();
      return;
    }
  };

  return (
    <Form method="post" className="container" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">
        Bem-vindo, {userData?.first_name}! Estamos no ambiente de{" "}
        {process.env.NODE_ENV === "production" ? "PRODUÇÃO" : "DESENVOLVIMENTO"}
      </h2>
      <h2 className="text-primary">💰 Solicitar Pagamento</h2>
      <DropdownSelect
        name="projectName"
        label="Projeto"
        options={projects}
        selectedValue={selectedProject?.spreadsheet_id || null}
        onChange={(value) => {
          const project = projects.find(
            (p: Project) => p.spreadsheet_id === value
          );
          setSelectedProject(project || null);
          setSelectedBudgetItem(null); // Resetar a rubrica ao mudar o projeto
        }}
        valueKey="spreadsheet_id"
        labelKey="name"
        placeholder="Selecione um projeto"
      />
      {selectedProject && (
        <DropdownSelect
          name="budgetItem"
          label="Rubrica"
          options={selectedProject.budget_items.map((item) => ({
            value: item,
            label: item,
          }))}
          selectedValue={selectedBudgetItem}
          onChange={(value) => setSelectedBudgetItem(value)}
          valueKey="value"
          labelKey="label"
          placeholder="Selecione uma rubrica"
        />
      )}
      <AutoCompleteInput
        label="Fornercedor"
        options={suppliers}
        value={supplier}
        onChange={setSupplier}
        name="supplierName"
        placeholder="Digite o nome do fornecedor"
        getOptionLabel={(supplier: Supplier) => supplier.nome}
      />
      <TextInput
        label="Descrição"
        value={description}
        onChange={setDescription}
        placeholder="Digite a descrição aqui"
        name="description"
      />
      <CurrencyInput
        label="Valor"
        valor={value}
        setValor={setValue}
        name="value"
      />
      <input type="hidden" name="telegramUserInfo" value={userDataStringfied} />
      <input
        type="hidden"
        name="project"
        value={selectedProjectStringfied} // Envia o objeto do projeto como JSON
      />
      <input
        type="hidden"
        name="supplier"
        value={selectedSuppierStringfied} // Envia o objeto do fornecedor como JSON
      />
      <button type="submit" className="button-full">
        Enviar Solicitação
      </button>
      <button
        type="button"
        className="button-secondary-full"
        onClick={() => navigate(-1)}
      >
        ⬅️ Voltar
      </button>
    </Form>
  );
}
