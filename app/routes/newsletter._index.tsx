import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export default function NewsletterIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simular loading e redirecionar
    const timer = setTimeout(() => {
      navigate("/newsletter/content");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Carregando Newsletter</h1>
        <p className="text-gray-600">Buscando eventos do calendário...</p>
      </div>
    </div>
  );
}