import { AppProps } from 'next/app';
import { Header } from '../components/Header';
import "../styles/global.scss";
import { SessionProvider as NestAuthProvider } from "next-auth/react";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
    <NestAuthProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NestAuthProvider>
    </>
  )
}

export default MyApp
