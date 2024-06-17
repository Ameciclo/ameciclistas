// src/app/pagamento/page.tsx
"use client";

import { useState } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  Tabs,
  Tab,
  Button,
} from "@mui/material";

const CreatePaymentPage = () => {
  const [project, setProject] = useState("");
  const [budgetItem, setBudgetItem] = useState("");
  const [supplier, setSupplier] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [tab, setTab] = useState(0);
  const [projects, setProjects] = useState([
    "Projeto 1",
    "Projeto 2",
    "Projeto 3",
  ]);
  const [budgetItems, setBudgetItems] = useState([
    "Item 1",
    "Item 2",
    "Item 3",
  ]);
  const [suppliers, setSuppliers] = useState([
    "Fornecedor 1",
    "Fornecedor 2",
    "Fornecedor 3",
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentData = {
      project,
      budgetItem,
      supplier,
      amount,
      description,
    };
    console.log("Payment Data:", paymentData);
    // Aqui você pode adicionar a lógica para salvar os dados do pagamento
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value) / 100);
    setAmount(formattedValue);
  };

  return (
    <div className="container mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full md:max-w-md"
      >

        <div className="mb-4">
          <Autocomplete
            options={projects}
            getOptionLabel={(option) => option}
            fullWidth
            onInputChange={(event, newInputValue) => setProject(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                id="project"
                label="Projeto"
                variant="outlined"
                required
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            )}
            className="mt-2"
          />
        </div>

        {project && (
           <div className="mb-4">
           <Autocomplete
             options={budgetItems}
             getOptionLabel={(option) => option}
             fullWidth
             onInputChange={(event, newInputValue) => setBudgetItem(newInputValue)}
             renderInput={(params) => (
               <TextField
                 {...params}
                 id="budgetItem"
                 label="Item Orçamentário"
                 variant="outlined"
                 required
                 className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
               />
             )}
             className="mt-2"
           />
         </div>
        )}

        <div className="mb-4">
          <Autocomplete
            options={suppliers}
            getOptionLabel={(option) => option}
            fullWidth
            onInputChange={(event, newInputValue) => setSupplier(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                id="supplier"
                label="Fornecedor"
                variant="outlined"
                required
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            )}
            className="mt-2"
          />
        </div>

        <div className="mb-4">
          <TextField
            id="amount"
            label="Valor"
            fullWidth
            value={amount}
            onChange={handleAmountChange}
            required
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <TextField
            id="description"
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Salvar
        </Button>
      </form>
    </div>
  );
};

export default CreatePaymentPage;
