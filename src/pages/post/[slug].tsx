import { GetStaticPaths, GetStaticProps } from 'next';
import { createClient } from '../../../prismicio';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { asHTML, asText } from '@prismicio/helpers';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const words = post?.data.content.map((item) => {
    const headingWords = item.heading.split(' ');
    const bodyWords = item.body.map((par) => par.text.split(' ')).reduce((prev, next) => [...prev, ...next], []);

    return [...headingWords, ...bodyWords];
  }).reduce((prev, next) => [...prev, ...next], []);
  const minReading = words ? Math.floor(words.length/200)+(words.length%200 > 0 ? 1 : 0) : 0;

  return (
    post ? (
      <main>
        <img src={post.data.banner.url} alt='banner' className={styles.banner}/>
        <article className={`${commonStyles.container} ${styles.post}`}>
          <h1>{post.data.title}</h1>
          <div>
            <FiCalendar size={20} /><time>{post.first_publication_date}</time>
            <FiUser size={20} /><span>{post.data.author}</span>
            <FiClock size={20} /><span>{minReading} min</span>
          </div>
          {post.data.content.map((item) => (
            <>
              <h2>{item.heading}</h2>
              {item.body.map((paragraph) => (
                <p>{paragraph.text}</p>
              ))}
            </>
          ))}
        </article>
      </main>
    ) : (
      <span>Carregando...</span>
    )
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = createClient();
  const posts = await prismic.getByType('posts');

  return {
    paths: posts.results.splice(0,2).map((post) => ({
      params: { slug: post.uid }
    })),
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async ({ params, previewData }) => {
  const { slug } = params;

  const prismic = createClient({ previewData });

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date:  format(
      new Date(response.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map((item) => ({
        heading: item.heading,
        body: [{ text: asText(item.body)}]
      }))
    }
  }

  return {
    props: {
      post
    },
    redirect: 60 * 30 //30min
  };
}