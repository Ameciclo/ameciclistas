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
  transactionType: string;
  paymentDate: string;
  projectId: string;
  budgetItem: string;
  supplierId: string;
  supplierInput: string;
  paymentMethod: string;
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
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([{
    id: crypto.randomUUID(),
    transactionType: "Solicitar Pagamento",
    paymentDate: new Date().toISOString().split("T")[0],
    projectId: "",
    budgetItem: "",
    supplierId: "",
    supplierInput: "",
    paymentMethod: "",
    isRefund: false,
    refundSupplierId: "",
    refundSupplierInput: "",
    description: "",
    quantity: 1,
    unitName: "unidade",
    unitValue: "0",
    totalValue: "0"
  }]);


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
      transactionType: "Solicitar Pagamento",
      paymentDate: new Date().toISOString().split("T")[0],
      projectId: "",
      budgetItem: "",
      supplierId: "",
      supplierInput: "",
      paymentMethod: "",
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
          const supplier = suppliers.find((s: any) => (s.id_number || s.id) === value);
          if (supplier && supplier.payment_methods && supplier.payment_methods.length > 0) {
            updated.paymentMethod = supplier.payment_methods[0].value || '';
          }
        }

        return updated;
      }
      return item;
    }));
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

  const validateDate = (item: PaymentItem) => {
    const today = new Date().toISOString().split("T")[0];
    if (item.transactionType === "Solicitar Pagamento" && item.paymentDate !== today) return false;
    if (item.transactionType === "Agendar pagamento" && item.paymentDate <= today) return false;
    return true;
  };

  const getItemErrors = (item: PaymentItem) => {
    const errors = [];
    if (!item.transactionType) errors.push("Tipo de Transação");
    if (!item.paymentDate) errors.push("Data do pagamento");
    if (!validateDate(item)) errors.push("Data inválida para o tipo");
    if (!item.projectId) errors.push("Projeto");
    if (!item.budgetItem) errors.push("Rubrica");
    if (!item.supplierId.trim()) errors.push("Fornecedor");
    if (item.supplierId && !item.paymentMethod) errors.push("Método de Pagamento");
    if (!item.description.trim()) errors.push("Descrição");
    if (parseFloat(item.totalValue) <= 0) errors.push("Valor deve ser maior que zero");
    if (item.isRefund && !item.refundSupplierId.trim()) errors.push("Pessoa Reembolsada");
    return errors;
  };

  const isFormValid = paymentItems.every(item => getItemErrors(item).length === 0);

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form method="post" className="container">
      <FormTitle>💰 Solicitar Pagamentos</FormTitle>

      
      {paymentItems.map((item, index) => {
        const selectedProject = projects.find(p => p.spreadsheet_id === item.projectId);
        const budgetOptions = selectedProject
          ? [{ value: "", label: "Selecione uma rubrica" }, ...selectedProject.budget_items.sort((a, b) => a.localeCompare(b)).map(budgetItem => ({ value: budgetItem, label: budgetItem }))]
          : [{ value: "", label: "Selecione uma rubrica" }];
        
        const itemErrors = getItemErrors(item);
        const hasErrors = itemErrors.length > 0;
        
        return (
          <div key={item.id} className={`border p-4 mb-4 rounded ${hasErrors ? 'border-red-300 bg-red-50' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Pagamento {index + 1} {hasErrors && '⚠️'}</h3>
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
            
            {hasErrors && (
              <div className="bg-red-100 p-2 mb-3 rounded text-red-800">
                <strong>Campos obrigatórios:</strong> {itemErrors.join(', ')}
              </div>
            )}
            
            <SelectInput
              label="Tipo de Transação:"
              name={`transactionType_${item.id}`}
              value={item.transactionType}
              onChange={(e) => updatePaymentItem(item.id, 'transactionType', e.target.value)}
              options={[
                { value: "Solicitar Pagamento", label: "Solicitar Pagamento" },
                { value: "Registrar pagamento", label: "Registrar pagamento" },
                { value: "Registrar Caixa Físico", label: "Registrar Caixa Físico" },
                { value: "Registro Caixa Digital", label: "Registro Caixa Digital" },
                { value: "Agendar pagamento", label: "Agendar pagamento" },
              ]}
            />
            
            <DateInput
              label="Data do pagamento:"
              value={item.paymentDate}
              onChange={(e: any) => updatePaymentItem(item.id, 'paymentDate', e.target.value)}
            />
            
            {item.transactionType === "Solicitar Pagamento" && item.paymentDate !== new Date().toISOString().split("T")[0] && (
              <div className="bg-red-100 p-2 mb-3 rounded text-red-800">
                ⚠️ Solicitações de pagamento devem ser para hoje
              </div>
            )}
            
            {item.transactionType === "Agendar pagamento" && item.paymentDate <= new Date().toISOString().split("T")[0] && (
              <div className="bg-red-100 p-2 mb-3 rounded text-red-800">
                ⚠️ Agendamentos devem ser para datas futuras
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
            
            {item.supplierId && (() => {
              const selectedSupplier = suppliers.find((s: any) => (s.id_number || s.id) === item.supplierId);
              const paymentMethods = selectedSupplier?.payment_methods || [];
              return paymentMethods.length > 0 ? (
                <SelectInput
                  label="Método de Pagamento:"
                  name={`paymentMethod_${item.id}`}
                  value={item.paymentMethod}
                  onChange={(e) => updatePaymentItem(item.id, 'paymentMethod', e.target.value)}
                  options={paymentMethods.map((method: any) => ({
                    value: method.value,
                    label: `${method.type}: ${method.value}`
                  }))}
                />
              ) : null;
            })()}

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
              <div className="form-group">
                <label className="form-label">Valor Unitário:</label>
                <input
                  type="text"
                  name={`unitValue_${item.id}`}
                  value={`R$ ${(parseFloat(item.unitValue || '0') / 100).toFixed(2).replace('.', ',')}`}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    updatePaymentItem(item.id, 'unitValue', numericValue);
                  }}
                  placeholder="R$ 0,00"
                  className="form-input"
                />
              </div>
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
      
      {!isFormValid && (
        <div className="bg-yellow-100 p-3 mb-4 rounded text-yellow-800">
          ⚠️ Verifique os campos obrigatórios nos pagamentos marcados
        </div>
      )}
      <SendToAction
        fields={[
          { name: "telegramUsersInfo", value: userJSONStringfyed },
          { name: "paymentItems", value: JSON.stringify(paymentItems) },
          { name: "projects", value: JSON.stringify(projects) },
          { name: "suppliers", value: JSON.stringify(suppliers) },
        ]}
      />
      <SubmitButton
        isEnabled={isFormValid}
        label={`🤞 Enviar ${paymentItems.length} Solicitaç${paymentItems.length > 1 ? 'ões' : 'ão'}`}
        userPermissions={userPermissions}
        requiredPermission={UserCategory.PROJECT_COORDINATORS}
      />
      {/* Botão único para adicionar fornecedor */}
      <GenericButton
        to="/gestao-fornecedores"
        label="📦 Gestão de Fornecedores"
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
