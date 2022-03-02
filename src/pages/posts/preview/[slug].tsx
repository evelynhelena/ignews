import { GetStaticPaths, GetStaticProps } from "next"
import {useSession } from "next-auth/react"
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../Services/prismic";
import styles from "../post.module.scss";

interface PostsPreviewProps {
    post: {
        slug: string;
        title: string;
        excerpt: string;
        updatedAt: string;
    }
}

export default function PostPreview({ post }: PostsPreviewProps) {
    const  {data: session} = useSession();
    const router = useRouter();
    useEffect(() => {
        if(session?.activeSubscription){
            router.push(`/posts/${post.slug}`);
        }
    },[session])

    return (
        <>
            <Head>
                <title>{post.title} | ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div
                        className={`${styles.postContent} ${styles.previewContent}`}
                        dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href="/">
                            <a>Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        /*paths: [
            {params: {slug: 'jquery-a-historia-da-biblioteca-js-mais-usada-da-ultima'} }
        ],*/
        paths:[],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params;
    const prismic = getPrismicClient();

    const response = await prismic.getByUID<any>('post', String(slug), {});
    console.log(response);
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        excerpt: RichText.asHtml(response.data.content.splice(0, 3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-br', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    return { props: { post, },redirect: 60 * 30 }
}