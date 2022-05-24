export default ({ data }) => {
  return (
    <div className='alert'>
      <div className='alert-top'>
        <div className='alert-icon'>{data.str || ''}</div>
      </div>
      <div>
        <div className='alert-name'>{data.name || ''} Alert </div>
        <span>criticality</span>
        <span>{data.warn || ''}</span>
      </div>
      <div>{data.time}</div>
    </div>
  );
};
