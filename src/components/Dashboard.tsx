import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

interface Property {
  id: string;
  status: string;
  address: string;
  surface: number;
}

interface Contract {
  tenant_id: string;
  property_id: string;
  rent: number;
}

interface User {
  id: string;
  name: string;
  role: 'proprietaire' | 'gestionnaire' | 'locataire';
  email: string;
  phone?: string;
}

interface Message {
  read: boolean;
  recipient_id: string;
}

interface Activity {
  id: string;
  type: 'payment' | 'contract' | 'incident';
  description: string;
  date: string;
}

interface TenantData {
  contract?: Contract;
  property?: Property;
  manager?: User;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Home, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Euro,
  Building2,
  MessageSquare
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { users, properties, contracts, messages, payments } = useData()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'proprietaire': return 'Propriétaire'
      case 'gestionnaire': return 'Gestionnaire'
      case 'locataire': return 'Locataire'
      default: return 'Utilisateur'
    }
  }

  // Calculate stats
  const totalProperties = properties.length
  const occupiedProperties = properties.filter((p: Property) => p.status === 'occupe').length
  const totalTenants = users.filter((u: User) => u.role === 'locataire').length
  const monthlyRevenue = contracts.reduce((sum: number, contract: Contract) => sum + contract.rent, 0)
  const pendingIncidents = 2 // Mock data
  const unreadMessages = messages.filter((msg: Message) => !msg.read && msg.recipient_id === user?.id).length

  // Recent activities
  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'payment',
      description: 'Paiement reçu - Appartement rue de la Paix',
      date: new Date().toISOString()
    },
    {
      id: '2',
      type: 'contract',
      description: 'Nouveau contrat signé - Studio centre-ville',
      date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      type: 'incident',
      description: 'Incident signalé - Problème de chauffage',
      date: new Date(Date.now() - 172800000).toISOString()
    }
  ]

  // Get tenant-specific data
  const getTenantData = (): TenantData | null => {
    if (user?.role !== 'locataire') return null

    const contract = contracts.find((c: Contract) => c.tenant_id === user.id)
    const property = contract ? properties.find((p: Property) => p.id === contract.property_id) : undefined
    const manager = users.find((u: User) => u.role === 'gestionnaire')

    return { contract, property, manager }
  }

  const tenantData = getTenantData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900 dark:text-white">
          {getGreeting()}, {user?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {getRoleTitle()} - Tableau de bord mhImmo
        </p>
      </div>

      {/* Stats Cards - For Proprietaire and Gestionnaire */}
      {(user?.role === 'proprietaire' || user?.role === 'gestionnaire') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total des biens</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                {occupiedProperties} occupés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Locataires</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                Actifs dans le système
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Revenus mensuels</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{monthlyRevenue.toLocaleString()}€</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{pendingIncidents}</div>
              <p className="text-xs text-muted-foreground">
                En attente de traitement
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Activités récentes
            </CardTitle>
            <CardDescription>
              Dernières actions sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'payment' && (
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                        <Euro className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {activity.type === 'contract' && (
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <Home className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    {activity.type === 'incident' && (
                      <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                        <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats or Tenant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              {user?.role === 'locataire' ? 'Mon logement' : 'Aperçu rapide'}
            </CardTitle>
            <CardDescription>
              {user?.role === 'locataire' 
                ? 'Informations sur votre location'
                : 'Informations importantes à retenir'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.role === 'locataire' && tenantData ? (
              <div className="space-y-4">
                {tenantData.property && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Adresse
                      </span>
                      <span className="text-sm font-medium">
                        {tenantData.property.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Loyer mensuel
                      </span>
                      <Badge variant="secondary">
                        {tenantData.contract?.rent.toLocaleString()}€
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Surface
                      </span>
                      <span className="text-sm">
                        {tenantData.property.surface}m²
                      </span>
                    </div>
                  </>
                )}
                {tenantData.manager && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Gestionnaire
                    </span>
                    <span className="text-sm">
                      {tenantData.manager.name}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {user?.role === 'proprietaire' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Taux d'occupation
                      </span>
                      <Badge variant="secondary">
                        {totalProperties > 0 
                          ? Math.round((occupiedProperties / totalProperties) * 100) 
                          : 0}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Biens disponibles
                      </span>
                      <Badge variant="outline">
                        {totalProperties - occupiedProperties}
                      </Badge>
                    </div>
                  </>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Messages non lus
                  </span>
                  <Badge variant={unreadMessages > 0 ? "destructive" : "secondary"}>
                    {unreadMessages}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Échéances cette semaine
                  </span>
                  <Badge variant="secondary">
                    {user?.role === 'locataire' ? '1' : '3'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tenant-specific additional info */}
      {user?.role === 'locataire' && tenantData?.manager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Communication
            </CardTitle>
            <CardDescription>
              Contact avec votre gestionnaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {tenantData.manager.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tenantData.manager.email}
                </p>
                {tenantData.manager.phone && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tenantData.manager.phone}
                  </p>
                )}
              </div>
              <Badge variant="secondary">
                {unreadMessages} message(s) non lu(s)
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}