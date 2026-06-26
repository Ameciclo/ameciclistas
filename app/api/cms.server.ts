const STRAPI_BASE = "https://do.strapi.ameciclo.org/api";

export async function getWorkgroups() {
  const response = await fetch(`${STRAPI_BASE}/workgroups?populate=icon`);
  if (!response.ok) {
    throw new Error(`Failed to fetch workgroups: ${response.statusText}`);
  }
  const { data } = await response.json();
  return data;
}

export async function getStrapiProjects() {
  const response = await fetch(`${STRAPI_BASE}/projects`);
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  const { data } = await response.json();
  return data;
}
