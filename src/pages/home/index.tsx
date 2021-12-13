import {useEffect}  from 'react';
import Action from '@/action';

interface ComponentProps {
    name: string;
    setName: (name: string) => void;
  }

function Component(props: ComponentProps) {
    return (
      <div
        onClick={() => {
          props.setName('1');
        }}
      >
        {props.name}
      </div>
    );
  }


function HomePage (){

    useEffect(() => {
    }, [])

    // const setName = (value: string) => {
    //     Action.emit('test.name', {
    //       bondName: bondThree.bondName + value,
    //     });
    //   };
    
  
    return <Component name={'111'} setName={'233'}></Component>
}

function mapStateToProps(state: any) {
    return {
      bondThree: state.scatter.curve.bondThree,
    };
  }
  
  export default connect(mapStateToProps)(HomePage);
  