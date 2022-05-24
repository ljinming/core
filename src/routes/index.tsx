import { Menu, Layout } from 'antd';
import Routers from './Router';
const { Header, Footer, Content } = Layout;

export default () => {
  return (
    <Layout>
      <Header>Header</Header>
      <Content></Content>
      <Footer>Footer</Footer>
    </Layout>
  );
};
