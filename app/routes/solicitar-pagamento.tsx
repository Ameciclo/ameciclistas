// routes/solicitar-pagamento.tsx

import { useEffect, useState } from "react";
import { useLoaderData, Form, Link } from "@remix-run/react";

import CurrenyValueInput from "~/components/Forms/Inputs/CurrencyValueInput";
import LongTextInput from "~/components/Forms/Inputs/LongTextInput";
import FormTitle from "~/components/Forms/FormTitle";
import {
  SubmitButton,
  BackButton,
  GenericButton,
} from "~/components/Forms/Buttons";
import SendToAction from "~/components/Forms/SendToAction";
import SelectInput from "~/components/Forms/Inputs/SelectInput";
import DateInput from "~/components/Forms/Inputs/DateInput";
import Checkbox from "~/components/Forms/Inputs/CheckBoxI";
import GenericAutosuggest from "~/components/Forms/Inputs/GenericAutosuggest";
import TextInput from "~/components/Forms/Inputs/TextInput";
import NumberInput from "~/components/Forms/Inputs/NumberInput";

import { Supplier, UserCategory, UserData } from "../utils/types";

interface PaymentItem {
  id: string;
  projectId: string;
  budgetItem: string;
  supplierId: string;
  supplierInput: string;
  isRefund: boolean;
  refundSupplierId: string;
  refundSupplierInput: string;
  description: string;
  quantity: number;
  unitName: string;
  unitValue: string;
  totalValue: string;
}

import { getTelegramUsersInfo } from "~/utils/users";
import { isAuth } from "~/utils/isAuthorized";
import Unauthorized from "~/components/Unauthorized";

import { action } from "~/handlers/actions/solicitar-pagamento";
import { loader } from "~/handlers/loaders/solicitar-pagamento";
export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers, currentUserCategories, usersInfo } =
    useLoaderData<typeof loader>();

  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [transactionType, setTransactionType] = useState("Solicitar Pagamento");
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([{
    id: crypto.randomUUID(),
    projectId: "",
    budgetItem: "",
    supplierId: "",
    supplierInput: "",
    isRefund: false,
    refundSupplierId: "",
    refundSupplierInput: "",
    description: "",
    quantity: 1,
    unitName: "unidade",
    unitValue: "0",
    totalValue: "0"
  }]);
  const [lastSupplierId, setLastSupplierId] = useState("");

  useEffect(() => {
    setUser(() => getTelegramUsersInfo());
  }, [usersInfo]);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  const addPaymentItem = () => {
    const newItem: PaymentItem = {
      id: crypto.randomUUID(),
      projectId: "",
      budgetItem: "",
      supplierId: lastSupplierId,
      supplierInput: lastSupplierId ? getSupplierDisplayName(lastSupplierId) : "",
      isRefund: false,
      refundSupplierId: "",
      refundSupplierInput: "",
      description: "",
      quantity: 1,
      unitName: "unidade",
      unitValue: "0",
      totalValue: "0"
    };
    setPaymentItems([...paymentItems, newItem]);
  };

  const removePaymentItem = (id: string) => {
    if (paymentItems.length > 1) {
      setPaymentItems(paymentItems.filter(item => item.id !== id));
    }
  };

  const updatePaymentItem = (id: string, field: keyof PaymentItem, value: any) => {
    setPaymentItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitValue') {
          const qty = field === 'quantity' ? value : updated.quantity;
          const unitVal = field === 'unitValue' ? value : updated.unitValue;
          updated.totalValue = (qty * parseFloat(unitVal.replace(/\D/g, '') || '0')).toString();
        }
        if (field === 'supplierId' && value) {
          setLastSupplierId(value);
        }
        return updated;
      }
      return item;
    }));
  };

  const getSupplierDisplayName = (supplierId: string) => {
    const supplier = suppliers.find((s: any) => (s.id_number || s.id) === supplierId);
    return supplier ? (supplier.nickname ? `${supplier.nickname} (${supplier.name})` : supplier.name) : "";
  };

  const calculateTotalValue = () => {
    return paymentItems.reduce((total, item) => {
      return total + parseFloat(item.totalValue || '0');
    }, 0);
  };

  const projectOptions = projects
    .map((project) => ({
      value: project.spreadsheet_id,
      label: project.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  projectOptions.unshift({ value: "", label: "Selecione um projeto" });

  const userJSONStringfyed = user
    ? JSON.stringify(user)
    : JSON.stringify({
        err: "Informações de usuário do telegram não encontrado",
      });

  const isFormValid = paymentDate !== "" && 
    transactionType !== "" && 
    paymentItems.every(item => 
      item.projectId !== "" &&
      item.budgetItem !== "" &&
      item.supplierId.trim() !== "" &&
      item.description.trim() !== "" &&
      parseFloat(item.totalValue) > 0 &&
      (!item.isRefund || item.refundSupplierId.trim() !== "")
    );

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form method="post" className="container">
      <FormTitle>💰 Solicitar Pagamentos</FormTitle>
      <DateInput
        label="Data do pagamento:"
        value={paymentDate}
        onChange={(e: any) => setPaymentDate(e.target.value)}
      />
      <SelectInput
        label="Tipo de Transação:"
        name="transactionType"
        value={transactionType}
        onChange={(e) => setTransactionType(e.target.value)}
        options={[
          { value: "Solicitar Pagamento", label: "Solicitar Pagamento" },
          { value: "Registrar pagamento", label: "Registrar pagamento" },
          { value: "Registrar Caixa Físico", label: "Registrar Caixa Físico" },
          { value: "Agendar pagamento", label: "Agendar pagamento" },
        ]}
      />
      
      {paymentItems.map((item, index) => {
        const selectedProject = projects.find(p => p.spreadsheet_id === item.projectId);
        const budgetOptions = selectedProject
          ? selectedProject.budget_items.sort((a, b) => a.localeCompare(b)).map(budgetItem => ({ value: budgetItem, label: budgetItem }))
          : [{ value: "", label: "Selecione uma rubrica" }];
        const isSameSupplier = lastSupplierId && item.supplierId === lastSupplierId && index > 0;
        
        return (
          <div key={item.id} className="border p-4 mb-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Pagamento {index + 1}</h3>
              {paymentItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePaymentItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❌ Remover
                </button>
              )}
            </div>
            
            {isSameSupplier && (
              <div className="bg-green-100 p-2 mb-3 rounded text-green-800">
                ✅ Mesmo fornecedor do pagamento anterior
              </div>
            )}
            
            <SelectInput
              label="Projeto:"
              name={`projectId_${item.id}`}
              value={item.projectId}
              onChange={(e) => updatePaymentItem(item.id, 'projectId', e.target.value)}
              options={projectOptions}
            />
            
            {item.projectId && (
              <SelectInput
                label="Rubrica:"
                name={`budgetItem_${item.id}`}
                value={item.budgetItem}
                onChange={(e) => updatePaymentItem(item.id, 'budgetItem', e.target.value)}
                options={budgetOptions}
              />
            )}

            <GenericAutosuggest<Supplier>
              title="Fornecedor:"
              items={suppliers}
              value={item.supplierInput}
              onChange={(value) => updatePaymentItem(item.id, 'supplierInput', value)}
              onSuggestionSelected={(_event, { suggestion }) => {
                const uniqueId = suggestion.id_number || suggestion.id;
                updatePaymentItem(item.id, 'supplierId', uniqueId);
                updatePaymentItem(item.id, 'supplierInput', 
                  suggestion.nickname ? `${suggestion.nickname} (${suggestion.name})` : suggestion.name
                );
              }}
              getItemValue={(supplier) => supplier.name}
              getItemLabel={(supplier) =>
                supplier.nickname ? `${supplier.nickname} (${supplier.name})` : supplier.name
              }
              filterFunction={(supplier, query) =>
                supplier.name.toLowerCase().includes(query.toLowerCase()) ||
                (supplier.nickname ? supplier.nickname.toLowerCase().includes(query.toLowerCase()) : false)
              }
            />

            <Checkbox 
              label="Reembolso" 
              checked={item.isRefund} 
              onChange={(checked) => updatePaymentItem(item.id, 'isRefund', checked)} 
            />
            
            {item.isRefund && (
              <GenericAutosuggest<Supplier>
                title="Pessoa Reembolsada:"
                items={suppliers}
                value={item.refundSupplierInput}
                onChange={(value) => updatePaymentItem(item.id, 'refundSupplierInput', value)}
                onSuggestionSelected={(_event, { suggestion }) => {
                  const uniqueId = suggestion.id_number || suggestion.id;
                  updatePaymentItem(item.id, 'refundSupplierId', uniqueId);
                  updatePaymentItem(item.id, 'refundSupplierInput',
                    suggestion.nickname ? `${suggestion.nickname} (${suggestion.name})` : suggestion.name
                  );
                }}
                getItemValue={(supplier) => supplier.name}
                getItemLabel={(supplier) =>
                  supplier.nickname ? `${supplier.nickname} (${supplier.name})` : supplier.name
                }
                filterFunction={(supplier, query) =>
                  supplier.name.toLowerCase().includes(query.toLowerCase()) ||
                  (supplier.nickname ? supplier.nickname.toLowerCase().includes(query.toLowerCase()) : false)
                }
              />
            )}

            <LongTextInput
              title="Descrição"
              text={item.description}
              setText={(value) => updatePaymentItem(item.id, 'description', value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberInput
                label="Quantidade:"
                value={item.quantity}
                onChange={(value) => updatePaymentItem(item.id, 'quantity', value)}
                min={1}
              />
              <TextInput
                label="Unidade:"
                value={item.unitName}
                onChange={(e) => updatePaymentItem(item.id, 'unitName', e.target.value)}
                placeholder="unidade"
              />
              <CurrenyValueInput
                name={`unitValue_${item.id}`}
                currencyValue={item.unitValue}
                setCurrencyValue={(value) => updatePaymentItem(item.id, 'unitValue', value)}
              />
            </div>
            
            <div className="mt-2 text-lg font-semibold">
              Total: R$ {(parseFloat(item.totalValue) / 100).toFixed(2).replace('.', ',')}
            </div>
          </div>
        );
      })}
      
      <button
        type="button"
        onClick={addPaymentItem}
        className="w-full mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ➕ Adicionar Outro Pagamento
      </button>
      
      <div className="text-xl font-bold mb-4">
        Valor Total Geral: R$ {(calculateTotalValue() / 100).toFixed(2).replace('.', ',')}
      </div>
      <SendToAction
        fields={[
          { name: "telegramUsersInfo", value: userJSONStringfyed },
          { name: "paymentItems", value: JSON.stringify(paymentItems) },
          { name: "paymentDate", value: paymentDate },
          { name: "projects", value: JSON.stringify(projects) },
          { name: "suppliers", value: JSON.stringify(suppliers) },
        ]}
      />
      <SubmitButton
        isEnabled={isFormValid}
        label={`🤞 Enviar ${paymentItems.length} Solicitação${paymentItems.length > 1 ? 'ões' : ''}`}
        userPermissions={userPermissions}
        requiredPermission={UserCategory.PROJECT_COORDINATORS}
      />
      {/* Botão único para adicionar fornecedor */}
      <GenericButton
        to="/adicionar-fornecedor"
        label="📦 Adicionar Fornecedor"
        userPermissions={userPermissions}
        requiredPermission={UserCategory.PROJECT_COORDINATORS}
      />
      <BackButton />
    </Form>
  ) : (
    <Unauthorized
      pageName="Solicitar Pagamentos"
      requiredPermission="Coordenador de Projeto"
    />
  );
}
