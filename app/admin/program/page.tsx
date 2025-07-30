import {ScheduleCard}  from "./components/ScheduleCard";
import  SpeakerCard  from "./components/SpeakerCard";

const ProgramPage = () => {
  return (
    <div className='min-h-screen'>
      <h1 className='text-4xl font-bold text-center'>Event Program</h1>

      <div className='mt-6 max-w-5xl mx-auto'>
              <ScheduleCard />
              <SpeakerCard />
      </div>
    </div>
  );
};

export default ProgramPage;
