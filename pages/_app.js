import "@/styles/globals.css";
import { UserProvider } from "../context/UserContext";
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </UserProvider>
  );
}
