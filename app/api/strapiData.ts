import fetch from "node-fetch";

export async function getWorkgroups() {
  const response = await fetch("https://cms.ameciclo.org/workgroups");
  if (!response.ok) {
    throw new Error("Failed to fetch workgroups");
  }
  const data = await response.json();
  return data;
}

export async function getStrapiProjects() {
  const response = await fetch("https://cms.ameciclo.org/projects");
  if (!response.ok) {
    throw new Error("Failed to fetch workgroups");
  }
  const data = await response.json();
  return data;
}