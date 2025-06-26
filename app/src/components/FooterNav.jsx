import { NavLink } from 'react-router-dom';
import { HomeIcon, MapPinIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function FooterNav() {
  const items = [
    { to: '/dashboard', icon: HomeIcon, label: 'Perfil' },
    { to: '/roadmap',  icon: MapPinIcon,  label: 'RoadMap' },
    { to: '/minigames', icon: QuestionMarkCircleIcon, label: 'Juegos' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className="flex flex-col items-center text-gray-500 hover:text-blue-500"
          style={({ isActive }) => ({ color: isActive ? '#3b82f6' : undefined })}
        >
          <Icon className="w-6 h-6" />
          <span className="text-xs">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
