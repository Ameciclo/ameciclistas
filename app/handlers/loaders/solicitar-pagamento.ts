// loaders/solicitar-pagamento-loader.ts
import { json } from "@remix-run/react";
import {
  getProjects,
  getSuppliers,
  getCategories,
} from "~/api/firebaseConnection.server";
import { Project, Supplier, UserCategory } from "~/utils/types";

export async function loader() {
  const projects: Project[] = Object.values(await getProjects());
  let suppliers: Supplier[] = await getSuppliers()
  suppliers = Object.values(suppliers).map(
    (supplier: any) => ({
      id: supplier.id || "",
      id_number: supplier.id_number || "",
      name: supplier.name || "",
      nickname: supplier.nickname || "",
      address: supplier.address || "",
      contacts: supplier.contacts || [],
      payment_methods: supplier.payment_methods || [],
      type: supplier.type|| "",
    })
  );
  const usersInfo = await getCategories();
  const currentUserCategories: UserCategory[] = [
    process.env.NODE_ENV === "development"
      ? UserCategory.DEVELOPMENT
      : UserCategory.ANY_USER,
  ];

  return json({
    projects,
    suppliers,
    currentUserCategories,
    usersInfo,
  });
}
