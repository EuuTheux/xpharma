import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Activity, 
  Package, 
  Pill, 
  FileText, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import ControleEstoque from '@/components/ControleEstoque';
import DispensacaoMedicamentos from '@/components/DispensacaoMedicamentos';
import RelatoriosDispensacao from '@/components/RelatoriosDispensacao';

type MenuOption = 'dashboard' | 'estoque' | 'dispensacao' | 'relatorios';

const MainApp: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuOption>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { usuario, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard' as MenuOption, label: 'Dashboard', icon: Activity },
    { id: 'estoque' as MenuOption, label: 'Controle de Estoque', icon: Package },
    { id: 'dispensacao' as MenuOption, label: 'Dispensação', icon: Pill },
    { id: 'relatorios' as MenuOption, label: 'Relatórios', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'estoque':
        return <ControleEstoque />;
      case 'dispensacao':
        return <DispensacaoMedicamentos />;
      case 'relatorios':
        return <RelatoriosDispensacao />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema Farmácia SUS</h1>
                <p className="text-sm text-gray-500">Gerenciamento Farmacêutico</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{usuario?.nome_completo}</p>
              <p className="text-xs text-gray-500">@{usuario?.usuario}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeMenu === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveMenu(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            <Card>
              <CardContent className="p-6">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainApp;