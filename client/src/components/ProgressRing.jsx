const ProgressRing = ({ progress = 70 }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className='relative w-10 h-10'>
      <svg className='w-full h-full rotate-[-90deg]'>
        <circle
          cx='20'
          cy='20'
          r={radius}
          stroke='gray'
          strokeWidth='3'
          fill='none'
        />
        <circle
          cx='20'
          cy='20'
          r={radius}
          stroke='orange'
          strokeWidth='3'
          fill='none'
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
        />
      </svg>

      <div className='absolute inset-0 flex items-center justify-center text-[10px]'>
        {progress}%
      </div>
    </div>
  );
};

export default ProgressRing;
