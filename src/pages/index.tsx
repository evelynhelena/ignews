//import styles from "../styles/home.module.scss";
import { GetStaticProps } from 'next'
import Head from 'next/head';
import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../Services/stripe';
import styles from './home.module.scss';

interface HomeProps{
  product:{
    priceId: string;
    amount: number;
  }
} 

export default function Home({product}:HomeProps) {
  return (
    <>
      <Head>
        <title> Home | ignews</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>Get acess to all the publications <br /> <span>or {product.amount} month</span></p>

          <SubscribeButton priceId={product.priceId}/>
        </section>
        <img src="images/avatar.svg" alt="Girl Coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1KFLKTLiy1zMR4IDpMbB0b0a')

  const product = {
    priceId: price.id,
    amount: Intl.NumberFormat('es-US',{style:'currency',currency:'USD'}).format(price.unit_amount / 100),
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24, // 24 Hours
  }
}
