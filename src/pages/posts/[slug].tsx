import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import { redirect } from "next/dist/server/api-utils";
import Head from "next/head";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../Services/prismic";
import styles from "./post.module.scss";

interface PostsProps{
    post:{
        slug: string;
        title: string;
        excerpt: string;
        updatedAt: string;
    }
}

export default function Post({post}:PostsProps){
    return(
        <>
            <Head>
                <title>{post.title} | ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div className={styles.postContent} dangerouslySetInnerHTML = {{__html: post.excerpt}}/>
                </article>
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({req,params}) => {
    const session = await getSession({req});
    const {slug} = params;
    console.log(session);
    if(!session.activeSubscription){
        return{
            redirect:{
                destination: '/',
                permanent: false
            }
        }
    }

    const prismic = getPrismicClient(req);

    const response = await prismic.getByUID<any>('post',String(slug),{});
    console.log(response);
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        excerpt: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-br', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    return { props:{post,}}
}