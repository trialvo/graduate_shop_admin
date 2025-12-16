import { useNavigate } from "react-router-dom";

interface Props {
  name: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const QuickAccessCard = ({ name, icon, color, path }: Props) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-4 py-6 shadow-theme-xs transition hover:shadow-theme-md dark:bg-gray-800"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${color}`}
      >
        {icon}
      </div>

      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {name}
      </span>
    </button>
  );
};

export default QuickAccessCard;
