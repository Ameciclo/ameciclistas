export async function getWorkgroups() {
  const response = await fetch("https://cms.ameciclo.org/workgroups");
  if (!response.ok) {
    throw new Error(`Failed to fetch workgroups: ${response.statusText}`);
  }
  return response.json(); // Retorna o JSON diretamente
}

export async function getStrapiProjects() {
  const response = await fetch("https://cms.ameciclo.org/projects");
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  return response.json(); // Retorna o JSON diretamente
}
