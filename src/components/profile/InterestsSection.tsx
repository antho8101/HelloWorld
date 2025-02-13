
import React from "react";

interface InterestsSectionProps {
  interestedIn: string[];
  lookingFor: string[];
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({
  interestedIn,
  lookingFor,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
      {interestedIn.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#6153BD] mb-2">Looking to Meet</h2>
          <p className="text-gray-700 capitalize">
            {interestedIn.join(", ")}
          </p>
        </div>
      )}

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
