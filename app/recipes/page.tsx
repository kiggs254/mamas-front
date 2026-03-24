import { serverApiGet } from "@/lib/server-api";

export default async function RecipesPage() {
  const data = await serverApiGet<{ recipes: unknown[] }>("/storefront/recipes");
  const recipes = data?.recipes || [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1>Recipes</h1>
      {recipes.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{JSON.stringify(recipes, null, 2)}</pre>
      )}
    </div>
  );
}
