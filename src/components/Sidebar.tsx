import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { 
  Building2, 
  Users, 
  Home, 
  MessageSquare, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  User
} from 'lucide-react'
import { Separator } from './ui/separator'
import { cn } from './ui/utils'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  darkMode, 
  onToggleDarkMode 
}) => {
  const { user, logout } = useAuth()

  const menuItems = {
    proprietaire: [
      { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
      { id: 'properties', label: 'Biens immobiliers', icon: Home },
      { id: 'tenants', label: 'Locataires', icon: Users },
      { id: 'managers', label: 'Gestionnaires', icon: User },
      { id: 'messages', label: 'Messagerie', icon: MessageSquare },
      { id: 'calendar', label: 'Calendrier', icon: Calendar },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
      { id: 'analytics', label: 'Analyses', icon: BarChart3 },
    ],
    gestionnaire: [
      { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
      { id: 'properties', label: 'Biens assignés', icon: Home },
      { id: 'tenants', label: 'Locataires', icon: Users },
      { id: 'messages', label: 'Messagerie', icon: MessageSquare },
      { id: 'calendar', label: 'Calendrier', icon: Calendar },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    ],
    locataire: [
      { id: 'dashboard', label: 'Mon espace', icon: Home },
      { id: 'contract', label: 'Mon contrat', icon: FileText },
      { id: 'payments', label: 'Paiements', icon: BarChart3 },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    ]
  }

  const currentMenu = menuItems[user?.role || 'locataire']

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-xl text-gray-900 dark:text-white">mhImmo</span>
        </div>
      </div>

      <Separator />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {currentMenu.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeSection === item.id
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDarkMode}
          className="w-full justify-start"
        >
          {darkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {darkMode ? 'Mode clair' : 'Mode sombre'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSectionChange('settings')}
          className="w-full justify-start"
        >
          <Settings className="h-4 w-4 mr-2" />
          Paramètres
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}