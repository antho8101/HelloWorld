
import React from "react";

interface InterestsSectionProps {
  interestedIn: string[];
  lookingFor: string[];
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({
  lookingFor,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 border-t pt-6">
      {lookingFor.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#6153BD] mb-2">Interested In</h2>
          <div className="space-y-1">
            {lookingFor.map((interest) => (
              <div key={interest} className="text-gray-700 capitalize">
                {interest.split('_').join(' ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
