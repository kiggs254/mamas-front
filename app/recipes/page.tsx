import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import shell from "../styles/shell.module.css";

type RecipeRow = {
  title?: string;
  name?: string;
  description?: string;
  body?: string;
  content?: string;
};

export default async function RecipesPage() {
  const data = await serverApiGet<{ recipes: RecipeRow[] }>("/storefront/recipes");
  const recipes = data?.recipes || [];

  return (
    <div className={shell.shell}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>Recipes</span>
      </nav>

      <header className={shell.pageHero}>
        <p className={shell.eyebrow}>In the kitchen</p>
        <h1 className={shell.title}>Recipes</h1>
        <div className={shell.titleUnderline} />
        <p className={shell.lead}>Ideas and inspiration using ingredients you can find in our shop.</p>
      </header>

      {recipes.length === 0 ? (
        <p className={shell.empty}>No recipes have been published yet.</p>
      ) : (
        <div>
          {recipes.map((r, i) => {
            const title = r.title || r.name || `Recipe ${i + 1}`;
            const text = r.description || "";
            const html = r.body || r.content;
            return (
              <article key={i} className={shell.recipeCard}>
                <h3>{title}</h3>
                {text ? <p className={shell.recipeDesc}>{text}</p> : null}
                {html ? (
                  <div className={`${shell.prose} ${shell.recipeBody}`} dangerouslySetInnerHTML={{ __html: html }} />
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
