// src/app/pagamento/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  Tabs,
  Tab,
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
    <Box className="container">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          borderRadius: 2,
        }}
      >
        <Autocomplete
          options={projects}
          getOptionLabel={(option) => option}
          fullWidth
          onInputChange={(event, newInputValue) => setProject(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Projeto"
              variant="outlined"
              required
            />
          )}
        />
        {project && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Item Orçamentário</InputLabel>
            <Select
              value={budgetItem}
              onChange={(e) => setBudgetItem(e.target.value)}
              label="Item Orçamentário"
              required
            >
              {budgetItems.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Autocomplete
          options={suppliers}
          getOptionLabel={(option) => option}
          fullWidth
          onInputChange={(event, newInputValue) => setSupplier(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Fornecedor"
              variant="outlined"
              required
            />
          )}
        />
        <TextField
          label="Valor"
          fullWidth
          margin="normal"
          value={amount}
          onChange={handleAmountChange}
          required
        />
        <TextField
          label="Descrição"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Salvar
        </Button>
      </Box>
    </Box>
  );
};

export default CreatePaymentPage;
