import Pretty from '@/components/Pretty';
import { relative } from 'path';
import './style.css';
import Alert from './Alert';

function Login() {
  let data = [
    {
      str: 'p1',
      warn: 'very high',
      name: 'p1 alert',
      time: new Date(),
    },
    {
      str: 'p2',
      warn: 'very hight',
      name: 'p2 alert',
      time: new Date(),
    },
    {
      str: 'p3',
      warn: 'very hight',
      name: 'p3 alert',
      time: new Date(),
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '600px',
        padding: '0 100px',
      }}
    >
      {data.map((item) => {
        return <Alert data={item} />;
      })}
      {/* <div style={{ background: 'red', width: '100%', float: 'left', height: '100%' }}></div>

      <div className='left' style={{ float: 'left', width: 100, height: '100%', background: 'blue' }}></div>
      <div className='right' style={{ float: 'left', width: 100, height: '100%', background: 'green' }}></div> */}
    </div>
  );
}

export default Login;
