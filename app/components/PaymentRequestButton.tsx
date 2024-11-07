import React, { useState, ChangeEvent } from 'react';
import googleService from '../services/googleService';

const PaymentRequestButton: React.FC = () => {
  const [data, setData] = useState<{
    name: string;
    startDate: string;
    endDate: string;
    description: string;
  }>({
    name: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRequestPayment = async () => {
    try {
      // Adicionar linha na planilha do Google Sheets
      await googleService.appendSheetRow(
        'YOUR_SPREADSHEET_ID',
        'SHEET_RANGE',
        [data.name, data.startDate, data.endDate, data.description]
      );

      // Criar evento no Google Calendar
      await googleService.createEvent({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        location: "Local Exemplo",
        description: data.description
      });

      alert("Solicitação de pagamento enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

  return (
    <div>
      <input name="name" placeholder="Nome do Evento" onChange={handleChange} />
      <input name="startDate" placeholder="Data de Início" onChange={handleChange} />
      <input name="endDate" placeholder="Data de Fim" onChange={handleChange} />
      <input name="description" placeholder="Descrição" onChange={handleChange} />
      <button onClick={handleRequestPayment}>Enviar Solicitação de Pagamento</button>
    </div>
  );
};

export default PaymentRequestButton;
