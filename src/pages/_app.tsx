import { PrismicPreview } from '@prismicio/next';
import { AppProps } from 'next/app';
import { repositoryName } from '../../prismicio';
import { Header } from '../components/Header';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PrismicPreview repositoryName={repositoryName}>
      <Header />
      <Component {...pageProps} />
    </PrismicPreview>
  );
}

export default MyApp;
