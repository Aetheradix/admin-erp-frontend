import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0a0f1a]">
      <Result
        status="403"
        title={<span className="text-white text-4xl font-black uppercase">403 Unauthorized</span>}
        subTitle={<span className="text-white/40">Sorry, you are not authorized to access this page.</span>}
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
            className="h-12 px-8 rounded-full font-black uppercase tracking-widest bg-white border-none text-black hover:bg-[#d4ff3f]!"
          >
            Back Home
          </Button>
        }
      />
    </div>
  );
};

export default Unauthorized;
