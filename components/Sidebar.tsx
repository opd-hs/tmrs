'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, getUser } from '@/lib/supabase-auth';
import { Thermometer, Phone, FileText, Refrigerator, User, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getUser();
    if (user) {
      setUserEmail(user.email || 'User');
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // All users see all menu items (no admin distinction)
  const temperatureItems = [
    { href: '/temperature-reporting', label: 'Temperature Reporting', icon: Thermometer },
    { href: '/pic-contacts', label: 'PIC Contact Number', icon: Phone },
    { href: '/view-reports', label: 'View Report', icon: FileText },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col hidden md:flex shadow-2xl ">
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800">
        <h1 className="text-4xl tracking-widest text-cyan-400 text-center">
          TMRS
        </h1>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Temperature Monitoring Section */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <h2 className="px-4 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Temperature Monitoring
          </h2>
          <ul className="space-y-2">
            {temperatureItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 transform scale-105'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:transform hover:scale-[1.02] hover:shadow-md'
                      }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>


      <div className="p-4 border-t border-slate-700/50 sticky bottom-0 bg-slate-900 space-y-2">
        <Link
          href="/manage-fridges"
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${pathname === '/manage-fridges'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 transform scale-105'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:transform hover:scale-[1.02] hover:shadow-md'
            }`}
        >
          <Refrigerator className="w-5 h-5 mr-3" />
          <span className="font-medium">Manage Fridge</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600/90 hover:text-white transition-all duration-200 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
