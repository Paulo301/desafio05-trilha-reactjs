import { GetStaticProps } from 'next';
import { createClient } from '../../prismicio';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Link from 'next/link';
import { useState } from 'react';
import { AllDocumentTypes } from '../../prismicio-types';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiCalendar, FiUser } from 'react-icons/fi';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function formatPost(post: AllDocumentTypes) {
  return {
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    }
  };
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPageLink, setNextPageLink] = useState<string | null>(postsPagination.next_page);

  function fetchMorePosts() {
    if(nextPageLink) {
      fetch(nextPageLink)
        .then(response => response.json())
        .then(data => {
          setPosts(posts => [...posts, ...data.results.map((post) => {
            return formatPost(post);
          })]);
          setNextPageLink(data.next_page);
        });
    }
  }

  return (
    <main className={commonStyles.container}>
      <div className={styles.posts}>
        {posts.map((post) => (
          <Link 
            href={`/post/${post.uid}`} 
            key={post.uid}
          >
            <strong>{post.data.title}</strong>
            <p>{post.data.subtitle}</p>
            <div>
              <FiCalendar size={20} /> <time>{post.first_publication_date}</time>
              <FiUser size={20} /> <span>{post.data.author}</span>
            </div>
          </Link>
        ))}
      </div>

      {nextPageLink && (
        <button onClick={fetchMorePosts}>Carregar mais posts</button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = createClient({ previewData });

  const response = await prismic.getByType('posts', {
    pageSize: 2
  });
  
  const posts = response.results.map((post) => {
    return formatPost(post);
  });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts
      }
    },
    redirect: 60 * 30 //30min
  };
}
