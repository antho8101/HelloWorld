
interface ProfileHeaderProps {
  onCancel: () => void;
}

export const ProfileHeader = ({ onCancel }: ProfileHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-black text-[#6153BD]">Create a Profile</h1>
      <button
        onClick={onCancel}
        className="px-4 py-2 text-sm text-[#FF6A48] hover:text-[#FF6A48]/90 font-bold"
      >
        Cancel
      </button>
    </div>
  );
};
