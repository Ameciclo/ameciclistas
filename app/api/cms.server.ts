export async function getStrapiProjects() {
  const response = await fetch("https://strapi.ameciclo.org/api/projects");
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  return response.json();
}
