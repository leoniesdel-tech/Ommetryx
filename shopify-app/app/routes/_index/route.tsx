// Öffentliche Startseite der App-Adresse. Bewusst ohne Eingabefeld für die Shop-Adresse:
// Die Installation startet nur über Shopify (App-Store-Regel 2.3.1).

import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
};

export default function App() {
  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Ommetryx</h1>
        <p className={styles.text}>Better fit. Fewer returns.</p>
        <p className={styles.text}>Ommetryx wird im Shopify-Admin Ihres Shops installiert und geöffnet.</p>
      </div>
    </div>
  );
}
