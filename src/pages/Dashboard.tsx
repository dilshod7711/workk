import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { deleteCookie } from '../utils/cookie';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => {
    deleteCookie('token');
    deleteCookie('refreshToken');
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="h-screen overflow-hidden bg-slate-50 font-sans flex">

      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-xs">
    
        <nav className="flex-1 px-4 pt-6 flex flex-col gap-2">
          <Link 
            to="/products" 
            className={`px-4 py-2.5 rounded-sm transition-all text-sm font-medium ${isActive('products') ? 'bg-[#1d2d5b] text-white shadow-xs' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            Mahsulotlar
          </Link>
          <Link 
            to="/comments" 
            className={`px-4 py-2.5 rounded-sm transition-all text-sm font-medium ${isActive('comments') ? 'bg-[#1d2d5b] text-white shadow-xs' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            Izohlar
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Button 
            variant="ghost" 
            onClick={() => setIsLogoutOpen(true)}
            className="w-full justify-start text-red-700 bg-red-100 hover:bg-red-200"
          >
            Tizimdan chiqish
          </Button>
        </div>
      </aside>


      <main className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </main>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tizimdan chiqish</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 text-sm">Haqiqatan ham tizimdan chiqmoqchimisiz?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>
              Yo'q, qolish
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Ha, chiqish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
