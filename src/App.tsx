import React, { useState, useEffect } from 'react'
import { DataProvider } from './contexts/DataContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { PropertiesManager } from './components/PropertiesManager'
import { TenantsManager } from './components/TenantsManager'
import { Messaging } from './components/Messaging'
import { Toaster } from './components/ui/sonner'
import './styles/globals.css'

const MainApp: React.FC = () => {
  const { user, loading } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem('mhimmo-dark-mode')
    return saved ? JSON.parse(saved) : false
  })

  // Apply dark mode and save preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('mhimmo-dark-mode', JSON.stringify(darkMode))
  }, [darkMode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de mhImmo...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'properties':
        return <PropertiesManager />
      case 'tenants':
        return <TenantsManager />
      case 'managers':
        return <TenantsManager />
      case 'messages':
        return <Messaging />
      case 'calendar':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Calendrier</h2>
            <p className="text-gray-600 dark:text-gray-400">Module calendrier en cours de développement</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Fonctionnalités prévues : échéances de paiement, rendez-vous, maintenance
            </p>
          </div>
        )
      case 'documents':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Documents</h2>
            <p className="text-gray-600 dark:text-gray-400">Module documents en cours de développement</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Fonctionnalités prévues : contrats PDF, reçus, pièces justificatives
            </p>
          </div>
        )
      case 'incidents':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Incidents</h2>
            <p className="text-gray-600 dark:text-gray-400">Module incidents en cours de développement</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Fonctionnalités prévues : déclaration, suivi, maintenance
            </p>
          </div>
        )
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Analyses</h2>
            <p className="text-gray-600 dark:text-gray-400">Module analytique en cours de développement</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Fonctionnalités prévues : graphiques de revenus, taux d'occupation, retards
            </p>
          </div>
        )
      case 'contract':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Mon contrat</h2>
            <p className="text-gray-600 dark:text-gray-400">Affichage du contrat locataire</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Fonctionnalités prévues : visualisation PDF, téléchargement, historique
            </p>
          </div>
        )
      case 'payments':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Paiements</h2>
            <p className="text-gray-600 dark:text-gray-400">Historique des paiements</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Fonctionnalités prévues : paiement en ligne, historique, reçus
            </p>
          </div>
        )
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Paramètres</h2>
            <p className="text-gray-600 dark:text-gray-400">Configuration du compte</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Fonctionnalités prévues : profil utilisateur, notifications, préférences
            </p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderMainContent()}
        </div>
      </main>
      
      <Toaster />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </DataProvider>
  )
}

export default App