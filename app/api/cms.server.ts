export async function getWorkgroups() {
  const response = await fetch("https://strapi.ameciclo.org/api/workgroups");
  if (!response.ok) {
    throw new Error(`Failed to fetch workgroups: ${response.statusText}`);
  }
  return response.json();
}

export async function getStrapiProjects() {
  const response = await fetch("https://strapi.ameciclo.org/api/projects");
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  return response.json();
}
