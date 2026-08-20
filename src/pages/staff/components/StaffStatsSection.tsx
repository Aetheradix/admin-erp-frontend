import { CalloutBanner } from '@/components/ui/composed/CalloutBanner';

export const StaffStatsSection = () => {
  return (
    <CalloutBanner
      padding="lg"
      className="mt-8"
      title={
        <>
          A Symphony of <br />
          <span className="text-primary">Diverse Expertise.</span>
        </>
      }
      description="Our team represents a collective of the brightest minds across multiple disciplines, working together to redefine enterprise technology."
      action={{ label: 'View Team' }}
    />
  );
};
