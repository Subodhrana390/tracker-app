import "@/styles/globals.css";
import { UserProvider } from "../context/UserContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
